namespace SurfOrSound.API.Models.Entities;

public class PushSubscription
{
    public Guid Id { get; set; }
    public Guid? GuestId { get; set; }
    public Guid? OwnerId { get; set; }
    public string Platform { get; set; } = string.Empty; // ios, android, web
    public string DeviceToken { get; set; } = string.Empty;
    public string? DeviceId { get; set; }
    public string? DeviceModel { get; set; }
    public string? AppVersion { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }
}

public class NotificationPreference
{
    public Guid Id { get; set; }
    public Guid? GuestId { get; set; }
    public Guid? OwnerId { get; set; }

    // Notification types
    public bool BookingConfirmation { get; set; } = true;
    public bool BookingReminders { get; set; } = true;
    public bool CheckInReminders { get; set; } = true;
    public bool CheckOutReminders { get; set; } = true;
    public bool PaymentReminders { get; set; } = true;
    public bool ReviewRequests { get; set; } = true;
    public bool Promotions { get; set; } = true;
    public bool LoyaltyUpdates { get; set; } = true;
    public bool AchievementUnlocks { get; set; } = true;
    public bool Messages { get; set; } = true;
    public bool DeviceAlerts { get; set; } = true; // Smart home alerts

    // Channels
    public bool EmailEnabled { get; set; } = true;
    public bool PushEnabled { get; set; } = true;
    public bool SmsEnabled { get; set; } = false;

    // Quiet hours
    public TimeOnly? QuietHoursStart { get; set; }
    public TimeOnly? QuietHoursEnd { get; set; }
    public string? Timezone { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Notification
{
    public Guid Id { get; set; }
    public Guid? GuestId { get; set; }
    public Guid? OwnerId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? ActionUrl { get; set; }
    public string? Data { get; set; } // JSON payload
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class NotificationLog
{
    public Guid Id { get; set; }
    public Guid NotificationId { get; set; }
    public string Channel { get; set; } = string.Empty; // push, email, sms
    public string Status { get; set; } = string.Empty; // sent, delivered, failed
    public string? ErrorMessage { get; set; }
    public string? ExternalId { get; set; } // Provider message ID
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeliveredAt { get; set; }
}

public static class NotificationTypes
{
    public const string BookingConfirmed = "BOOKING_CONFIRMED";
    public const string BookingCancelled = "BOOKING_CANCELLED";
    public const string CheckInReminder = "CHECKIN_REMINDER";
    public const string CheckOutReminder = "CHECKOUT_REMINDER";
    public const string PaymentDue = "PAYMENT_DUE";
    public const string PaymentReceived = "PAYMENT_RECEIVED";
    public const string ReviewRequest = "REVIEW_REQUEST";
    public const string AchievementUnlocked = "ACHIEVEMENT_UNLOCKED";
    public const string LoyaltyTierUp = "LOYALTY_TIER_UP";
    public const string PointsEarned = "POINTS_EARNED";
    public const string NewMessage = "NEW_MESSAGE";
    public const string DeviceAlert = "DEVICE_ALERT";
    public const string AccessCodeReady = "ACCESS_CODE_READY";
    public const string Promotion = "PROMOTION";
    public const string TripReminder = "TRIP_REMINDER";
}
