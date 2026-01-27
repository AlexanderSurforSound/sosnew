namespace SurfOrSound.API.Models.Entities;

public class ServiceRequest
{
    public Guid Id { get; set; }
    public Guid GuestId { get; set; }
    public string? TrackReservationId { get; set; }
    public string PropertyTrackId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "open";
    public string Priority { get; set; } = "normal";
    public string? AssignedTo { get; set; }
    public string? Resolution { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}

public class ServiceRequestNote
{
    public Guid Id { get; set; }
    public Guid ServiceRequestId { get; set; }
    public string AuthorType { get; set; } = string.Empty; // guest, staff, system
    public string? AuthorId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class MarketplaceCategory
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? ParentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class OwnerPayout
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string PropertyTrackId { get; set; } = string.Empty;
    public string? TrackReservationId { get; set; }
    public string PayoutType { get; set; } = string.Empty; // rental, damage_deposit, cleaning
    public decimal GrossAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string Status { get; set; } = "pending"; // pending, scheduled, paid, failed
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class TripVideo
{
    public Guid Id { get; set; }
    public Guid GuestId { get; set; }
    public string TrackReservationId { get; set; } = string.Empty;
    public string PropertyTrackId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending, processing, ready, failed
    public string? VideoUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int DurationSeconds { get; set; }
    public string? Photos { get; set; } // JSON array of photos used
    public string? MusicTrack { get; set; }
    public string? Template { get; set; }
    public DateTime? ProcessingStartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public static class ServiceCategories
{
    public const string Maintenance = "maintenance";
    public const string Cleaning = "cleaning";
    public const string Concierge = "concierge";
    public const string Emergency = "emergency";
    public const string Question = "question";
    public const string Complaint = "complaint";
}

public static class ServicePriorities
{
    public const string Low = "low";
    public const string Normal = "normal";
    public const string High = "high";
    public const string Urgent = "urgent";
}
