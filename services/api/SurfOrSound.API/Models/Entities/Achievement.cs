namespace SurfOrSound.API.Models.Entities;

public class Achievement
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // booking, exploration, engagement, loyalty, seasonal
    public string Icon { get; set; } = string.Empty;
    public string BadgeImageUrl { get; set; } = string.Empty;
    public int PointsAwarded { get; set; }
    public bool IsHidden { get; set; } // Hidden achievements for discovery
    public bool IsActive { get; set; } = true;
    public string? Criteria { get; set; } // JSON criteria for automatic unlocking
    public int? RequiredCount { get; set; } // e.g., 5 bookings, 3 reviews
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class GuestAchievement
{
    public Guid Id { get; set; }
    public Guid GuestId { get; set; }
    public Guid AchievementId { get; set; }
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
    public string? UnlockContext { get; set; } // JSON with details (which property, reservation, etc.)
    public bool IsNew { get; set; } = true; // For showing "new" badge in UI

    // Navigation
    public Achievement? Achievement { get; set; }
}

public static class AchievementCategories
{
    public const string Booking = "booking";
    public const string Exploration = "exploration";
    public const string Engagement = "engagement";
    public const string Loyalty = "loyalty";
    public const string Seasonal = "seasonal";
    public const string Secret = "secret";
}

public static class AchievementCodes
{
    // Booking achievements
    public const string FirstBooking = "FIRST_BOOKING";
    public const string ReturnGuest = "RETURN_GUEST";
    public const string FiveStays = "FIVE_STAYS";
    public const string TenStays = "TEN_STAYS";
    public const string LongStay = "LONG_STAY"; // 7+ nights
    public const string LastMinute = "LAST_MINUTE"; // Booked within 48 hours

    // Exploration achievements
    public const string VillageExplorer = "VILLAGE_EXPLORER"; // Visited 3 villages
    public const string IslandMaster = "ISLAND_MASTER"; // Stayed in all villages
    public const string BeachHopper = "BEACH_HOPPER"; // Stayed in 5 beachfront properties

    // Engagement achievements
    public const string FirstReview = "FIRST_REVIEW";
    public const string TopReviewer = "TOP_REVIEWER"; // 5+ reviews
    public const string Referrer = "REFERRER"; // Successful referral
    public const string SuperReferrer = "SUPER_REFERRER"; // 5+ referrals
    public const string SandyFriend = "SANDY_FRIEND"; // Used AI concierge 10 times

    // Loyalty achievements
    public const string Adventurer = "ADVENTURER_TIER";
    public const string Islander = "ISLANDER_TIER";
    public const string Legend = "LEGEND_TIER";

    // Seasonal achievements
    public const string SummerSurfer = "SUMMER_SURFER";
    public const string OffSeasonExplorer = "OFF_SEASON_EXPLORER";
    public const string HolidayHost = "HOLIDAY_HOST"; // Stayed during holidays

    // Secret achievements
    public const string Lighthouse = "LIGHTHOUSE_VISIT"; // Stayed near lighthouse
    public const string SunriseWatcher = "SUNRISE_WATCHER"; // Oceanfront property
}
