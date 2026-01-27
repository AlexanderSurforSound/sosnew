using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Services;

public interface IAchievementService
{
    Task<List<Achievement>> GetAllAchievementsAsync();
    Task<List<GuestAchievement>> GetGuestAchievementsAsync(Guid guestId);
    Task<GuestAchievement?> UnlockAchievementAsync(Guid guestId, string achievementCode, string? context = null);
    Task CheckAndUnlockAchievementsAsync(Guid guestId, AchievementTrigger trigger, object? data = null);
    Task<int> GetGuestAchievementCountAsync(Guid guestId);
}

public class AchievementService : IAchievementService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;
    private readonly ICacheService _cacheService;
    private readonly ILogger<AchievementService> _logger;

    public AchievementService(
        AppDbContext db,
        INotificationService notificationService,
        ICacheService cacheService,
        ILogger<AchievementService> logger)
    {
        _db = db;
        _notificationService = notificationService;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<List<Achievement>> GetAllAchievementsAsync()
    {
        return await _cacheService.GetOrSetAsync(
            "achievements:all",
            async () => await _db.Achievements
                .Where(a => a.IsActive && !a.IsHidden)
                .OrderBy(a => a.Category)
                .ThenBy(a => a.Name)
                .ToListAsync(),
            RedisCacheService.CacheDurations.Long
        );
    }

    public async Task<List<GuestAchievement>> GetGuestAchievementsAsync(Guid guestId)
    {
        return await _db.GuestAchievements
            .Include(ga => ga.Achievement)
            .Where(ga => ga.GuestId == guestId)
            .OrderByDescending(ga => ga.UnlockedAt)
            .ToListAsync();
    }

    public async Task<GuestAchievement?> UnlockAchievementAsync(Guid guestId, string achievementCode, string? context = null)
    {
        var achievement = await _db.Achievements.FirstOrDefaultAsync(a => a.Code == achievementCode && a.IsActive);
        if (achievement == null)
        {
            _logger.LogWarning("Achievement {Code} not found", achievementCode);
            return null;
        }

        // Check if already unlocked
        var existing = await _db.GuestAchievements
            .FirstOrDefaultAsync(ga => ga.GuestId == guestId && ga.AchievementId == achievement.Id);

        if (existing != null)
        {
            _logger.LogDebug("Guest {GuestId} already has achievement {Code}", guestId, achievementCode);
            return existing;
        }

        // Unlock the achievement
        var guestAchievement = new GuestAchievement
        {
            Id = Guid.NewGuid(),
            GuestId = guestId,
            AchievementId = achievement.Id,
            UnlockedAt = DateTime.UtcNow,
            UnlockContext = context,
            IsNew = true
        };

        _db.GuestAchievements.Add(guestAchievement);

        // Award loyalty points
        if (achievement.PointsAwarded > 0)
        {
            var loyaltyTransaction = new LoyaltyTransaction
            {
                Id = Guid.NewGuid(),
                GuestId = guestId,
                Points = achievement.PointsAwarded,
                Type = "achievement",
                Description = $"Achievement unlocked: {achievement.Name}",
                CreatedAt = DateTime.UtcNow
            };
            _db.LoyaltyTransactions.Add(loyaltyTransaction);

            // Update guest points
            var guest = await _db.Guests.FindAsync(guestId);
            if (guest != null)
            {
                guest.LoyaltyPoints += achievement.PointsAwarded;
            }
        }

        await _db.SaveChangesAsync();

        // Send notification
        await _notificationService.SendAchievementUnlockedAsync(guestId, achievement);

        _logger.LogInformation("Guest {GuestId} unlocked achievement {Code}", guestId, achievementCode);

        guestAchievement.Achievement = achievement;
        return guestAchievement;
    }

    public async Task CheckAndUnlockAchievementsAsync(Guid guestId, AchievementTrigger trigger, object? data = null)
    {
        switch (trigger)
        {
            case AchievementTrigger.BookingCompleted:
                await CheckBookingAchievements(guestId);
                break;
            case AchievementTrigger.ReviewSubmitted:
                await CheckReviewAchievements(guestId);
                break;
            case AchievementTrigger.ReferralCompleted:
                await CheckReferralAchievements(guestId);
                break;
            case AchievementTrigger.ChatInteraction:
                await CheckChatAchievements(guestId);
                break;
            case AchievementTrigger.LoyaltyPointsEarned:
                await CheckLoyaltyAchievements(guestId);
                break;
        }
    }

    public async Task<int> GetGuestAchievementCountAsync(Guid guestId)
    {
        return await _db.GuestAchievements.CountAsync(ga => ga.GuestId == guestId);
    }

    private async Task CheckBookingAchievements(Guid guestId)
    {
        var guest = await _db.Guests.FindAsync(guestId);
        if (guest == null) return;

        // First booking
        if (guest.TotalStays == 1)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.FirstBooking);
        }

        // Return guest (2+ bookings)
        if (guest.TotalStays == 2)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.ReturnGuest);
        }

        // 5 stays
        if (guest.TotalStays == 5)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.FiveStays);
        }

        // 10 stays
        if (guest.TotalStays == 10)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.TenStays);
        }
    }

    private async Task CheckReviewAchievements(Guid guestId)
    {
        var reviewCount = await _db.PropertyReviews
            .CountAsync(r => r.GuestId == guestId && r.Status == ReviewStatuses.Approved);

        if (reviewCount == 1)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.FirstReview);
        }

        if (reviewCount >= 5)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.TopReviewer);
        }
    }

    private async Task CheckReferralAchievements(Guid guestId)
    {
        var referralCount = await _db.Referrals
            .CountAsync(r => r.ReferrerId == guestId && r.Status == "completed");

        if (referralCount >= 1)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.Referrer);
        }

        if (referralCount >= 5)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.SuperReferrer);
        }
    }

    private async Task CheckChatAchievements(Guid guestId)
    {
        var messageCount = await _db.ConversationMessages
            .Where(m => m.Conversation != null && m.Conversation.GuestId == guestId && m.Role == "user")
            .CountAsync();

        if (messageCount >= 10)
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.SandyFriend);
        }
    }

    private async Task CheckLoyaltyAchievements(Guid guestId)
    {
        var guest = await _db.Guests.FindAsync(guestId);
        if (guest == null) return;

        if (guest.LoyaltyPoints >= 1000 && guest.LoyaltyTier == "Explorer")
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.Adventurer);
        }

        if (guest.LoyaltyPoints >= 5000 && guest.LoyaltyTier == "Adventurer")
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.Islander);
        }

        if (guest.LoyaltyPoints >= 15000 && guest.LoyaltyTier == "Islander")
        {
            await UnlockAchievementAsync(guestId, AchievementCodes.Legend);
        }
    }
}

public enum AchievementTrigger
{
    BookingCompleted,
    ReviewSubmitted,
    ReferralCompleted,
    ChatInteraction,
    LoyaltyPointsEarned,
    PropertyViewed,
    CheckedIn,
    CheckedOut
}
