using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;

namespace SurfOrSound.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/users")]
public class UserManagementController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<UserManagementController> _logger;
    private readonly IConfiguration _config;

    public UserManagementController(
        AppDbContext db,
        ILogger<UserManagementController> logger,
        IConfiguration config)
    {
        _db = db;
        _logger = logger;
        _config = config;
    }

    private bool ValidateAdminKey()
    {
        var adminKey = Request.Headers["X-Admin-Key"].FirstOrDefault();
        var expectedKey = _config["AdminKey"];
        return !string.IsNullOrEmpty(expectedKey) && adminKey == expectedKey;
    }

    /// <summary>
    /// Get a summary of user statistics including migration status.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<UserStats>> GetStats()
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var stats = new UserStats
        {
            TotalUsers = await _db.Guests.CountAsync(),
            MigratedUsers = await _db.Guests.CountAsync(g => g.IsMigrated),
            RequirePasswordReset = await _db.Guests.CountAsync(g => g.RequiresPasswordReset),
            LockedOutUsers = await _db.Guests.CountAsync(g => g.IsLockedOut),
            InactiveUsers = await _db.Guests.CountAsync(g => g.IsInactive),
            UsersWithLegacyPassword = await _db.Guests.CountAsync(g => g.AllowLoginWithLegacyPassword)
        };

        return Ok(stats);
    }

    /// <summary>
    /// Search for users by email.
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<AdminUserDto>>> SearchUsers(
        [FromQuery] string? email,
        [FromQuery] bool? isMigrated,
        [FromQuery] bool? isLockedOut,
        [FromQuery] bool? requiresPasswordReset,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var query = _db.Guests.AsQueryable();

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(g => g.Email.Contains(email.ToLowerInvariant()));

        if (isMigrated.HasValue)
            query = query.Where(g => g.IsMigrated == isMigrated.Value);

        if (isLockedOut.HasValue)
            query = query.Where(g => g.IsLockedOut == isLockedOut.Value);

        if (requiresPasswordReset.HasValue)
            query = query.Where(g => g.RequiresPasswordReset == requiresPasswordReset.Value);

        var users = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(g => new AdminUserDto
            {
                Id = g.Id,
                Email = g.Email,
                FirstName = g.FirstName,
                LastName = g.LastName,
                Phone = g.Phone,
                IsLockedOut = g.IsLockedOut,
                IsInactive = g.IsInactive,
                IsMigrated = g.IsMigrated,
                RequiresPasswordReset = g.RequiresPasswordReset,
                HasPassword = !string.IsNullOrEmpty(g.PasswordHash),
                HasLegacyPassword = g.AllowLoginWithLegacyPassword,
                LegacyId = g.LegacyId,
                PmsUserId = g.PmsUserId,
                LastLoginAt = g.LastLoginAt,
                CreatedAt = g.CreatedAt,
                MigratedAt = g.MigratedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Get a specific user by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminUserDto>> GetUser(Guid id)
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
            return NotFound(new { message = "User not found" });

        return Ok(new AdminUserDto
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
            IsLockedOut = guest.IsLockedOut,
            IsInactive = guest.IsInactive,
            IsMigrated = guest.IsMigrated,
            RequiresPasswordReset = guest.RequiresPasswordReset,
            HasPassword = !string.IsNullOrEmpty(guest.PasswordHash),
            HasLegacyPassword = guest.AllowLoginWithLegacyPassword,
            LegacyId = guest.LegacyId,
            PmsUserId = guest.PmsUserId,
            UmbracoMemberId = guest.UmbracoMemberId,
            LoyaltyTier = guest.LoyaltyTier,
            LoyaltyPoints = guest.LoyaltyPoints,
            TotalStays = guest.TotalStays,
            LastLoginAt = guest.LastLoginAt,
            CreatedAt = guest.CreatedAt,
            MigratedAt = guest.MigratedAt
        });
    }

    /// <summary>
    /// Unlock a user account.
    /// </summary>
    [HttpPost("{id:guid}/unlock")]
    public async Task<ActionResult> UnlockUser(Guid id)
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
            return NotFound(new { message = "User not found" });

        guest.IsLockedOut = false;
        guest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Admin unlocked user {UserId} ({Email})", id, guest.Email);

        return Ok(new { message = "User unlocked successfully" });
    }

    /// <summary>
    /// Lock a user account.
    /// </summary>
    [HttpPost("{id:guid}/lock")]
    public async Task<ActionResult> LockUser(Guid id)
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
            return NotFound(new { message = "User not found" });

        guest.IsLockedOut = true;
        guest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Admin locked user {UserId} ({Email})", id, guest.Email);

        return Ok(new { message = "User locked successfully" });
    }

    /// <summary>
    /// Activate a user account.
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult> ActivateUser(Guid id)
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
            return NotFound(new { message = "User not found" });

        guest.IsInactive = false;
        guest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Admin activated user {UserId} ({Email})", id, guest.Email);

        return Ok(new { message = "User activated successfully" });
    }

    /// <summary>
    /// Deactivate a user account.
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    public async Task<ActionResult> DeactivateUser(Guid id)
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
            return NotFound(new { message = "User not found" });

        guest.IsInactive = true;
        guest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Admin deactivated user {UserId} ({Email})", id, guest.Email);

        return Ok(new { message = "User deactivated successfully" });
    }

    /// <summary>
    /// Force a password reset requirement for a user.
    /// </summary>
    [HttpPost("{id:guid}/require-password-reset")]
    public async Task<ActionResult> RequirePasswordReset(Guid id)
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
            return NotFound(new { message = "User not found" });

        guest.RequiresPasswordReset = true;
        guest.PasswordHash = null; // Clear the password
        guest.AllowLoginWithLegacyPassword = false;
        guest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Admin required password reset for user {UserId} ({Email})", id, guest.Email);

        return Ok(new { message = "Password reset required. User must use forgot password flow." });
    }

    /// <summary>
    /// Clear the password reset requirement for a user (after they've reset their password).
    /// </summary>
    [HttpPost("{id:guid}/clear-password-reset")]
    public async Task<ActionResult> ClearPasswordReset(Guid id)
    {
        if (!ValidateAdminKey())
            return Unauthorized(new { message = "Invalid admin key" });

        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
            return NotFound(new { message = "User not found" });

        guest.RequiresPasswordReset = false;
        guest.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Admin cleared password reset requirement for user {UserId} ({Email})", id, guest.Email);

        return Ok(new { message = "Password reset requirement cleared" });
    }
}

public class UserStats
{
    public int TotalUsers { get; set; }
    public int MigratedUsers { get; set; }
    public int RequirePasswordReset { get; set; }
    public int LockedOutUsers { get; set; }
    public int InactiveUsers { get; set; }
    public int UsersWithLegacyPassword { get; set; }
}

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? SecondaryPhone { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public bool IsLockedOut { get; set; }
    public bool IsInactive { get; set; }
    public bool IsMigrated { get; set; }
    public bool RequiresPasswordReset { get; set; }
    public bool HasPassword { get; set; }
    public bool HasLegacyPassword { get; set; }
    public int? LegacyId { get; set; }
    public int? PmsUserId { get; set; }
    public int? UmbracoMemberId { get; set; }
    public string? LoyaltyTier { get; set; }
    public int LoyaltyPoints { get; set; }
    public int TotalStays { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? MigratedAt { get; set; }
}
