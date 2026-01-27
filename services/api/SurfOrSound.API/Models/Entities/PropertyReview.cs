namespace SurfOrSound.API.Models.Entities;

public class PropertyReview
{
    public Guid Id { get; set; }
    public Guid GuestId { get; set; }
    public string PropertyTrackId { get; set; } = string.Empty;
    public string? TrackReservationId { get; set; }

    // Ratings (1-5 scale)
    public int OverallRating { get; set; }
    public int? CleanlinessRating { get; set; }
    public int? AccuracyRating { get; set; }
    public int? CheckInRating { get; set; }
    public int? CommunicationRating { get; set; }
    public int? LocationRating { get; set; }
    public int? ValueRating { get; set; }

    // Review content
    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;

    // Trip details
    public string? TripType { get; set; } // family, romantic, friends, solo, business
    public DateTime? StayStartDate { get; set; }
    public DateTime? StayEndDate { get; set; }

    // Media
    public string? Photos { get; set; } // JSON array of photo URLs

    // Moderation
    public string Status { get; set; } = "pending"; // pending, approved, rejected, flagged
    public string? ModerationNotes { get; set; }
    public Guid? ModeratedById { get; set; }
    public DateTime? ModeratedAt { get; set; }

    // Response
    public string? OwnerResponse { get; set; }
    public DateTime? OwnerRespondedAt { get; set; }

    // Helpfulness
    public int HelpfulCount { get; set; }

    public bool IsVerifiedStay { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ReviewHelpful
{
    public Guid Id { get; set; }
    public Guid ReviewId { get; set; }
    public Guid? GuestId { get; set; }
    public string? SessionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ReviewRequest
{
    public Guid Id { get; set; }
    public Guid GuestId { get; set; }
    public string PropertyTrackId { get; set; } = string.Empty;
    public string TrackReservationId { get; set; } = string.Empty;
    public DateTime StayEndDate { get; set; }
    public string Status { get; set; } = "pending"; // pending, sent, completed, expired
    public DateTime? SentAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int ReminderCount { get; set; }
    public DateTime? LastReminderAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public static class ReviewStatuses
{
    public const string Pending = "pending";
    public const string Approved = "approved";
    public const string Rejected = "rejected";
    public const string Flagged = "flagged";
}

public static class TripTypes
{
    public const string Family = "family";
    public const string Romantic = "romantic";
    public const string Friends = "friends";
    public const string Solo = "solo";
    public const string Business = "business";
    public const string Group = "group";
}
