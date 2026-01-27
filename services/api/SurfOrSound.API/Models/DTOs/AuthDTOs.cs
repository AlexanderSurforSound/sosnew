namespace SurfOrSound.API.Models.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest
{
    public string Email { get; init; } = "";
    public string Password { get; init; } = "";
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string? Phone { get; init; }
}

public record AuthResponse
{
    public string Token { get; init; } = "";
    public UserDto User { get; init; } = new();
}

public record UserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = "";
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Phone { get; init; }
    public string LoyaltyTier { get; init; } = "Explorer";
    public int LoyaltyPoints { get; init; }
    public int TotalStays { get; init; }

    // Address fields
    public string? AddressLine1 { get; init; }
    public string? AddressLine2 { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }

    // Additional phone
    public string? MobilePhone { get; init; }
    public string? SecondaryPhone { get; init; }

    // Preferences
    public bool EmailMarketingOptIn { get; init; }

    // Account status
    public bool RequiresPasswordReset { get; init; }
    public bool IsMigrated { get; init; }
}

public record UpdateUserRequest
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Phone { get; init; }
    public string? MobilePhone { get; init; }
    public string? SecondaryPhone { get; init; }
    public string? AddressLine1 { get; init; }
    public string? AddressLine2 { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }
    public bool? EmailMarketingOptIn { get; init; }
}

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Token, string NewPassword);
