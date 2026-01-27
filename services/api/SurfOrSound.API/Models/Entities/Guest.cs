namespace SurfOrSound.API.Models.Entities;

public class Guest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = "";
    public string? PasswordHash { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? TrackGuestId { get; set; }
    public string LoyaltyTier { get; set; } = "Explorer";
    public int LoyaltyPoints { get; set; } = 0;
    public int TotalStays { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Address fields (from Umbraco Member)
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }

    // Additional phone (Umbraco has MobilePhone and SecondaryPhone)
    public string? MobilePhone { get; set; }
    public string? SecondaryPhone { get; set; }

    // Legacy IDs from Umbraco for reference/lookup
    public int? LegacyId { get; set; }
    public int? PmsUserId { get; set; }
    public int? PmsAgentId { get; set; }
    public int? UmbracoMemberId { get; set; }

    // Legacy password support for migration
    public string? LegacyPasswordKey { get; set; }
    public string? LegacyPasswordSalt { get; set; }
    public bool AllowLoginWithLegacyPassword { get; set; } = false;

    // Preferences
    public bool EmailMarketingOptIn { get; set; } = false;
    public string? FavoriteHomes { get; set; } // Legacy comma-separated list of Track IDs

    // Account status
    public bool IsInactive { get; set; } = false;
    public bool IsLockedOut { get; set; } = false;
    public DateTime? LastLoginAt { get; set; }

    // Migration flags
    public bool RequiresPasswordReset { get; set; } = false;
    public bool IsMigrated { get; set; } = false;
    public DateTime? MigratedAt { get; set; }
}

public class GuestFavorite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GuestId { get; set; }
    public string PropertyTrackId { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class LoyaltyTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GuestId { get; set; }
    public int Points { get; set; }
    public string Type { get; set; } = ""; // earned, redeemed, expired
    public string? Description { get; set; }
    public string? ReservationTrackId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Referral
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReferrerId { get; set; }
    public string ReferralCode { get; set; } = "";
    public Guid? ReferredGuestId { get; set; }
    public string? ReferredReservationId { get; set; }
    public string Status { get; set; } = "pending"; // pending, completed, expired
    public int? PointsAwarded { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
