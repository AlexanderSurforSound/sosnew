namespace SurfOrSound.API.Models.Entities;

public class Vendor
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Email { get; set; } = "";
    public string? PasswordHash { get; set; }
    public string? Phone { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Category { get; set; } // activities, dining, services, retail
    public string Tier { get; set; } = "Basic"; // Basic, Pro, Premier
    public decimal CommissionRate { get; set; } = 0.25m;
    public string? StripeConnectId { get; set; }
    public string Status { get; set; } = "pending"; // pending, approved, suspended
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class VendorListing
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VendorId { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string? Description { get; set; }
    public string ListingType { get; set; } = "service"; // service, product, experience
    public decimal Price { get; set; }
    public string? PriceUnit { get; set; } // per_person, per_hour, per_item, flat
    public int? Duration { get; set; } // in minutes, for experiences
    public int? MaxCapacity { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool RequiresReservation { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
