namespace SurfOrSound.API.Integrations.Umbraco;

/// <summary>
/// Model representing a member exported from Umbraco database.
/// Maps to the LegacyUser structure used by the old site.
/// </summary>
public class UmbracoMemberExport
{
    public int Id { get; set; }
    public int MemberId { get; set; }
    public string Email { get; set; } = "";
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    // Address
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }

    // Phones
    public string? MobilePhone { get; set; }
    public string? SecondaryPhone { get; set; }

    // Legacy IDs for reference
    public int LegacyId { get; set; }
    public int PmsUserId { get; set; }
    public int PmsAgentId { get; set; }

    // Password fields for migration (int arrays from JSON, converted to base64 for storage)
    public int[]? LegacyPasswordSalt { get; set; }
    public int[]? LegacyPasswordKey { get; set; }
    public bool AllowLoginWithLegacyPassword { get; set; }

    // Helper to convert int array to base64 string
    public string? GetPasswordSaltBase64() => LegacyPasswordSalt != null
        ? Convert.ToBase64String(LegacyPasswordSalt.Select(i => (byte)i).ToArray())
        : null;

    public string? GetPasswordKeyBase64() => LegacyPasswordKey != null
        ? Convert.ToBase64String(LegacyPasswordKey.Select(i => (byte)i).ToArray())
        : null;

    // Preferences
    public bool EmailMarketingOptIn { get; set; }
    public string? FavoriteHomes { get; set; }

    // Status
    public bool Inactive { get; set; }
    public bool IsLockedOut { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime? CreatedDate { get; set; }
}

/// <summary>
/// Result of a member migration operation
/// </summary>
public class MemberMigrationResult
{
    public int TotalProcessed { get; set; }
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
    public int Failed { get; set; }
    public List<MemberMigrationError> Errors { get; set; } = new();
}

public class MemberMigrationError
{
    public string Email { get; set; } = "";
    public int? LegacyId { get; set; }
    public string Error { get; set; } = "";
}
