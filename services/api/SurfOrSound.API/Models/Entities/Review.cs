namespace SurfOrSound.API.Models.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PropertyId { get; set; } = "";
    public Guid GuestId { get; set; }
    public string? ReservationId { get; set; }

    // Ratings (1-5)
    public int OverallRating { get; set; }
    public int? CleanlinessRating { get; set; }
    public int? AccuracyRating { get; set; }
    public int? CommunicationRating { get; set; }
    public int? LocationRating { get; set; }
    public int? ValueRating { get; set; }

    // Content
    public string? Title { get; set; }
    public string Content { get; set; } = "";
    public string? OwnerResponse { get; set; }
    public DateTime? OwnerResponseDate { get; set; }

    // Trip details
    public DateTime StayDate { get; set; }
    public string? TripType { get; set; } // family, couples, friends, solo, business

    // Metadata
    public bool IsVerified { get; set; }
    public bool IsPublished { get; set; } = true;
    public int HelpfulCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Guest? Guest { get; set; }
}
