using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Hubs;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Services;

public interface INotificationService
{
    Task SendNotificationAsync(Guid userId, string type, string title, string body, string? imageUrl = null, string? actionUrl = null, object? data = null);
    Task SendAchievementUnlockedAsync(Guid userId, Achievement achievement);
    Task SendLoyaltyUpdateAsync(Guid userId, int currentPoints, int pointsChange, string currentTier, string? newTier);
    Task SendDeviceStatusAsync(string propertyId, string deviceId, string deviceType, string status, double? temperature = null);
    Task SendReservationUpdateAsync(string reservationId, string propertyId, string status, string? message = null);
    Task BroadcastToPropertyAsync(string propertyId, string type, object message);
    Task<List<Notification>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;
    private readonly AppDbContext _db;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IHubContext<NotificationHub, INotificationClient> hubContext,
        AppDbContext db,
        ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _db = db;
        _logger = logger;
    }

    public async Task SendNotificationAsync(Guid userId, string type, string title, string body,
        string? imageUrl = null, string? actionUrl = null, object? data = null)
    {
        // Save to database
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            GuestId = userId,
            Type = type,
            Title = title,
            Body = body,
            ImageUrl = imageUrl,
            ActionUrl = actionUrl,
            Data = data != null ? System.Text.Json.JsonSerializer.Serialize(data) : null,
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        // Send via SignalR
        var message = new NotificationMessage(
            notification.Id.ToString(),
            type,
            title,
            body,
            imageUrl,
            actionUrl,
            notification.CreatedAt
        );

        await _hubContext.Clients.Group($"user:{userId}").ReceiveNotification(message);
        _logger.LogInformation("Notification sent to user {UserId}: {Type}", userId, type);
    }

    public async Task SendAchievementUnlockedAsync(Guid userId, Achievement achievement)
    {
        var message = new AchievementUnlockedMessage(
            achievement.Id.ToString(),
            achievement.Code,
            achievement.Name,
            achievement.Description,
            achievement.BadgeImageUrl,
            achievement.PointsAwarded,
            DateTime.UtcNow
        );

        await _hubContext.Clients.Group($"user:{userId}").ReceiveAchievement(message);

        // Also send as a notification
        await SendNotificationAsync(
            userId,
            NotificationTypes.AchievementUnlocked,
            "Achievement Unlocked!",
            $"You earned the {achievement.Name} badge!",
            achievement.BadgeImageUrl,
            "/account/achievements"
        );
    }

    public async Task SendLoyaltyUpdateAsync(Guid userId, int currentPoints, int pointsChange,
        string currentTier, string? newTier)
    {
        var pointsToNext = CalculatePointsToNextTier(currentPoints, currentTier);

        var message = new LoyaltyUpdateMessage(
            currentPoints,
            pointsChange,
            currentTier,
            newTier,
            pointsToNext
        );

        await _hubContext.Clients.Group($"user:{userId}").ReceiveLoyaltyUpdate(message);

        if (!string.IsNullOrEmpty(newTier))
        {
            await SendNotificationAsync(
                userId,
                NotificationTypes.LoyaltyTierUp,
                $"Welcome to {newTier}!",
                $"Congratulations! You've reached {newTier} status. Enjoy your new benefits!",
                actionUrl: "/account/rewards"
            );
        }
    }

    public async Task SendDeviceStatusAsync(string propertyId, string deviceId, string deviceType,
        string status, double? temperature = null)
    {
        var message = new DeviceStatusMessage(
            deviceId,
            propertyId,
            deviceType,
            status,
            temperature,
            null,
            DateTime.UtcNow
        );

        await _hubContext.Clients.Group($"property:{propertyId}").ReceiveDeviceStatus(message);
    }

    public async Task SendReservationUpdateAsync(string reservationId, string propertyId,
        string status, string? message = null)
    {
        var updateMessage = new ReservationUpdateMessage(
            reservationId,
            propertyId,
            status,
            message,
            DateTime.UtcNow
        );

        await _hubContext.Clients.Group($"reservation:{reservationId}").ReceiveReservationUpdate(updateMessage);
    }

    public async Task BroadcastToPropertyAsync(string propertyId, string type, object message)
    {
        // For owner notifications about their property
        await _hubContext.Clients.Group($"property:{propertyId}").ReceiveNotification(
            new NotificationMessage(
                Guid.NewGuid().ToString(),
                type,
                "Property Update",
                message.ToString() ?? "",
                null,
                null,
                DateTime.UtcNow
            )
        );
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        return await _db.Notifications
            .Where(n => n.GuestId == userId && (n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow))
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.GuestId == userId);

        if (notification != null && !notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _db.Notifications
            .Where(n => n.GuestId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.IsRead, true)
                .SetProperty(n => n.ReadAt, DateTime.UtcNow));
    }

    private int CalculatePointsToNextTier(int currentPoints, string currentTier)
    {
        return currentTier switch
        {
            "Explorer" => 1000 - currentPoints,
            "Adventurer" => 5000 - currentPoints,
            "Islander" => 15000 - currentPoints,
            "Legend" => 0, // Max tier
            _ => 1000 - currentPoints
        };
    }
}
