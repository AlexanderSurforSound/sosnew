namespace SurfOrSound.API.Models.Entities;

public class Owner
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = "";
    public string? PasswordHash { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? TrackOwnerId { get; set; }
    public string? PropertyIds { get; set; } // Comma-separated Track property IDs
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class AnalyticsEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? SessionId { get; set; }
    public Guid? GuestId { get; set; }
    public string EventType { get; set; } = "";
    public string? EventData { get; set; } // JSON
    public string? PageUrl { get; set; }
    public string? Referrer { get; set; }
    public string? DeviceType { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
