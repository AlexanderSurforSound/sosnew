using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SurfOrSound.API.Data;
using SurfOrSound.API.Models.DTOs;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<UserDto> GetUserAsync(Guid userId);
    Task<UserDto> UpdateUserAsync(Guid userId, UpdateUserRequest request);
    string GenerateToken(Guest guest);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext db, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var guest = await _db.Guests.FirstOrDefaultAsync(g => g.Email == request.Email.ToLowerInvariant());
        if (guest == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Check if account is locked or inactive
        if (guest.IsLockedOut)
        {
            throw new UnauthorizedAccessException("Account is locked");
        }

        if (guest.IsInactive)
        {
            throw new UnauthorizedAccessException("Account is inactive");
        }

        bool isPasswordValid = false;
        bool needsPasswordUpgrade = false;

        // Try BCrypt first (modern password hash)
        if (!string.IsNullOrEmpty(guest.PasswordHash))
        {
            try
            {
                isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, guest.PasswordHash);
            }
            catch
            {
                // BCrypt verification failed (possibly malformed hash)
                isPasswordValid = false;
            }
        }

        // If BCrypt failed and legacy password is allowed, try legacy validation
        if (!isPasswordValid && guest.AllowLoginWithLegacyPassword)
        {
            isPasswordValid = LegacyPasswordHelper.ValidateLegacyPassword(
                request.Password,
                guest.LegacyPasswordSalt,
                guest.LegacyPasswordKey);

            if (isPasswordValid)
            {
                needsPasswordUpgrade = true;
            }
        }

        if (!isPasswordValid)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Upgrade legacy password to BCrypt (transparent migration)
        if (needsPasswordUpgrade)
        {
            guest.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            guest.AllowLoginWithLegacyPassword = false;
            // Keep legacy fields for audit purposes but they're no longer used
            _logger.LogInformation("Upgraded legacy password to BCrypt for user {UserId}", guest.Id);
        }

        // Update last login time
        guest.LastLoginAt = DateTime.UtcNow;
        guest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var token = GenerateToken(guest);

        return new AuthResponse
        {
            Token = token,
            User = MapToUserDto(guest)
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingGuest = await _db.Guests.FirstOrDefaultAsync(g => g.Email == request.Email.ToLowerInvariant());
        if (existingGuest != null)
        {
            throw new InvalidOperationException("An account with this email already exists");
        }

        var guest = new Guest
        {
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            LoyaltyTier = "Explorer",
            LoyaltyPoints = 0
        };

        _db.Guests.Add(guest);
        await _db.SaveChangesAsync();

        var token = GenerateToken(guest);

        return new AuthResponse
        {
            Token = token,
            User = MapToUserDto(guest)
        };
    }

    public async Task<UserDto> GetUserAsync(Guid userId)
    {
        var guest = await _db.Guests.FindAsync(userId);
        if (guest == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        return MapToUserDto(guest);
    }

    public async Task<UserDto> UpdateUserAsync(Guid userId, UpdateUserRequest request)
    {
        var guest = await _db.Guests.FindAsync(userId);
        if (guest == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (request.FirstName != null) guest.FirstName = request.FirstName;
        if (request.LastName != null) guest.LastName = request.LastName;
        if (request.Phone != null) guest.Phone = request.Phone;
        if (request.MobilePhone != null) guest.MobilePhone = request.MobilePhone;
        if (request.SecondaryPhone != null) guest.SecondaryPhone = request.SecondaryPhone;
        if (request.AddressLine1 != null) guest.AddressLine1 = request.AddressLine1;
        if (request.AddressLine2 != null) guest.AddressLine2 = request.AddressLine2;
        if (request.City != null) guest.City = request.City;
        if (request.State != null) guest.State = request.State;
        if (request.PostalCode != null) guest.PostalCode = request.PostalCode;
        if (request.Country != null) guest.Country = request.Country;
        if (request.EmailMarketingOptIn.HasValue) guest.EmailMarketingOptIn = request.EmailMarketingOptIn.Value;
        guest.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToUserDto(guest);
    }

    public string GenerateToken(Guest guest)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var issuer = _config["Jwt:Issuer"];
        var expirationDays = int.Parse(_config["Jwt:ExpirationDays"] ?? "7");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, guest.Id.ToString()),
            new Claim(ClaimTypes.Email, guest.Email),
            new Claim(ClaimTypes.GivenName, guest.FirstName ?? ""),
            new Claim(ClaimTypes.Surname, guest.LastName ?? ""),
            new Claim("loyalty_tier", guest.LoyaltyTier)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: issuer,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expirationDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToUserDto(Guest guest)
    {
        return new UserDto
        {
            Id = guest.Id,
            Email = guest.Email,
            FirstName = guest.FirstName,
            LastName = guest.LastName,
            Phone = guest.Phone,
            MobilePhone = guest.MobilePhone,
            SecondaryPhone = guest.SecondaryPhone,
            AddressLine1 = guest.AddressLine1,
            AddressLine2 = guest.AddressLine2,
            City = guest.City,
            State = guest.State,
            PostalCode = guest.PostalCode,
            Country = guest.Country,
            LoyaltyTier = guest.LoyaltyTier,
            LoyaltyPoints = guest.LoyaltyPoints,
            TotalStays = guest.TotalStays,
            EmailMarketingOptIn = guest.EmailMarketingOptIn,
            RequiresPasswordReset = guest.RequiresPasswordReset,
            IsMigrated = guest.IsMigrated
        };
    }
}
