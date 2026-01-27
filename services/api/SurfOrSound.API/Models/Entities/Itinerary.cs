namespace SurfOrSound.API.Models.Entities;

public class TripItinerary
{
    public Guid Id { get; set; }
    public Guid GuestId { get; set; }
    public string? TrackReservationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "draft"; // draft, active, completed
    public string? GeneratedBy { get; set; } // "ai" or "user"
    public string? AiPrompt { get; set; } // Original prompt used to generate
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<ItineraryItem> Items { get; set; } = new List<ItineraryItem>();
}

public class ItineraryItem
{
    public Guid Id { get; set; }
    public Guid ItineraryId { get; set; }
    public DateTime Date { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string Type { get; set; } = string.Empty; // activity, dining, attraction, relaxation, travel
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ExternalUrl { get; set; }
    public string? ImageUrl { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? Notes { get; set; }
    public int SortOrder { get; set; }
    public bool IsBooked { get; set; }
    public string? BookingReference { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public TripItinerary? Itinerary { get; set; }
}

public class SearchHistory
{
    public Guid Id { get; set; }
    public Guid? GuestId { get; set; }
    public string? SessionId { get; set; }
    public string SearchType { get; set; } = string.Empty; // standard, ai, voice
    public string? Query { get; set; } // Natural language query for AI search
    public string? Filters { get; set; } // JSON of applied filters
    public int ResultCount { get; set; }
    public string? SelectedPropertyId { get; set; } // If they clicked a result
    public bool ConvertedToBooking { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PropertyView
{
    public Guid Id { get; set; }
    public Guid? GuestId { get; set; }
    public string? SessionId { get; set; }
    public string PropertyTrackId { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty; // search, direct, recommendation, email
    public int DurationSeconds { get; set; }
    public bool ViewedGallery { get; set; }
    public bool ViewedAvailability { get; set; }
    public bool ViewedReviews { get; set; }
    public bool StartedBooking { get; set; }
    public bool CompletedBooking { get; set; }
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
}

public static class ItineraryItemTypes
{
    public const string Activity = "activity";
    public const string Dining = "dining";
    public const string Attraction = "attraction";
    public const string Relaxation = "relaxation";
    public const string Travel = "travel";
    public const string Shopping = "shopping";
    public const string Event = "event";
}
