using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Integrations.Umbraco;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Services;

public interface IMemberMigrationService
{
    Task<MemberMigrationResult> ImportFromJsonFileAsync(string filePath, bool updateExisting = false);
    Task<MemberMigrationResult> ImportFromJsonAsync(string jsonContent, bool updateExisting = false);
}

public class MemberMigrationService : IMemberMigrationService
{
    private readonly AppDbContext _db;
    private readonly ILogger<MemberMigrationService> _logger;

    public MemberMigrationService(AppDbContext db, ILogger<MemberMigrationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<MemberMigrationResult> ImportFromJsonFileAsync(string filePath, bool updateExisting = false)
    {
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"Member export file not found: {filePath}");
        }

        var jsonContent = await File.ReadAllTextAsync(filePath);
        return await ImportFromJsonAsync(jsonContent, updateExisting);
    }

    public async Task<MemberMigrationResult> ImportFromJsonAsync(string jsonContent, bool updateExisting = false)
    {
        var result = new MemberMigrationResult();

        List<UmbracoMemberExport>? members;
        try
        {
            members = JsonSerializer.Deserialize<List<UmbracoMemberExport>>(jsonContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse member export JSON");
            throw new InvalidOperationException("Invalid JSON format for member export", ex);
        }

        if (members == null || members.Count == 0)
        {
            _logger.LogWarning("No members found in export file");
            return result;
        }

        _logger.LogInformation("Starting migration of {Count} members", members.Count);

        foreach (var member in members)
        {
            result.TotalProcessed++;

            try
            {
                await ProcessMemberAsync(member, updateExisting, result);
            }
            catch (Exception ex)
            {
                result.Failed++;
                result.Errors.Add(new MemberMigrationError
                {
                    Email = member.Email,
                    LegacyId = member.LegacyId,
                    Error = ex.Message
                });
                _logger.LogError(ex, "Failed to migrate member {Email} (LegacyId: {LegacyId})",
                    member.Email, member.LegacyId);
            }

            // Log progress every 100 members
            if (result.TotalProcessed % 100 == 0)
            {
                _logger.LogInformation("Processed {Count}/{Total} members",
                    result.TotalProcessed, members.Count);
            }
        }

        _logger.LogInformation(
            "Migration complete. Created: {Created}, Updated: {Updated}, Skipped: {Skipped}, Failed: {Failed}",
            result.Created, result.Updated, result.Skipped, result.Failed);

        return result;
    }

    private async Task ProcessMemberAsync(UmbracoMemberExport member, bool updateExisting, MemberMigrationResult result)
    {
        if (string.IsNullOrWhiteSpace(member.Email))
        {
            result.Skipped++;
            _logger.LogWarning("Skipping member with no email (LegacyId: {LegacyId})", member.LegacyId);
            return;
        }

        var email = member.Email.ToLowerInvariant().Trim();

        // Check if member already exists
        var existingGuest = await _db.Guests.FirstOrDefaultAsync(g => g.Email == email);

        if (existingGuest != null)
        {
            if (updateExisting)
            {
                UpdateGuestFromMember(existingGuest, member);
                await _db.SaveChangesAsync();
                result.Updated++;
                _logger.LogDebug("Updated existing member {Email}", email);
            }
            else
            {
                result.Skipped++;
                _logger.LogDebug("Skipped existing member {Email} (updateExisting=false)", email);
            }
            return;
        }

        // Create new guest
        var guest = new Guest
        {
            Email = email,
            FirstName = member.FirstName?.Trim(),
            LastName = member.LastName?.Trim(),

            // Address
            AddressLine1 = member.AddressLine1?.Trim(),
            AddressLine2 = member.AddressLine2?.Trim(),
            City = member.City?.Trim(),
            State = member.State?.Trim(),
            PostalCode = member.PostalCode?.Trim(),
            Country = member.Country?.Trim(),

            // Phones
            MobilePhone = member.MobilePhone?.Trim(),
            SecondaryPhone = member.SecondaryPhone?.Trim(),
            Phone = member.MobilePhone?.Trim() ?? member.SecondaryPhone?.Trim(),

            // Legacy IDs
            LegacyId = member.LegacyId > 0 ? member.LegacyId : null,
            PmsUserId = member.PmsUserId > 0 ? member.PmsUserId : null,
            PmsAgentId = member.PmsAgentId > 0 ? member.PmsAgentId : null,
            UmbracoMemberId = member.MemberId > 0 ? member.MemberId : null,

            // Legacy password (for transparent migration - convert int arrays to base64)
            LegacyPasswordSalt = member.GetPasswordSaltBase64(),
            LegacyPasswordKey = member.GetPasswordKeyBase64(),
            AllowLoginWithLegacyPassword = member.LegacyPasswordSalt != null &&
                member.LegacyPasswordKey != null &&
                member.LegacyPasswordSalt.Length > 0 &&
                member.LegacyPasswordKey.Length > 0,

            // Preferences
            EmailMarketingOptIn = member.EmailMarketingOptIn,
            FavoriteHomes = member.FavoriteHomes?.Trim(),

            // Status
            IsInactive = member.Inactive,
            IsLockedOut = member.IsLockedOut,
            LastLoginAt = member.LastLogin,

            // Loyalty (new users start at Explorer)
            LoyaltyTier = "Explorer",
            LoyaltyPoints = 0,
            TotalStays = 0,

            // Migration flags
            IsMigrated = true,
            MigratedAt = DateTime.UtcNow,
            // Require password reset if no legacy password data available
            RequiresPasswordReset = member.LegacyPasswordSalt == null ||
                                   member.LegacyPasswordKey == null ||
                                   member.LegacyPasswordSalt.Length == 0 ||
                                   member.LegacyPasswordKey.Length == 0,

            CreatedAt = member.CreatedDate ?? DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Guests.Add(guest);
        await _db.SaveChangesAsync();
        result.Created++;
        _logger.LogDebug("Created new member {Email} from LegacyId {LegacyId}", email, member.LegacyId);
    }

    private void UpdateGuestFromMember(Guest guest, UmbracoMemberExport member)
    {
        // Only update fields that aren't already set or if the import has newer data
        if (string.IsNullOrEmpty(guest.FirstName) && !string.IsNullOrEmpty(member.FirstName))
            guest.FirstName = member.FirstName.Trim();

        if (string.IsNullOrEmpty(guest.LastName) && !string.IsNullOrEmpty(member.LastName))
            guest.LastName = member.LastName.Trim();

        // Address - update if not set
        if (string.IsNullOrEmpty(guest.AddressLine1) && !string.IsNullOrEmpty(member.AddressLine1))
            guest.AddressLine1 = member.AddressLine1.Trim();
        if (string.IsNullOrEmpty(guest.City) && !string.IsNullOrEmpty(member.City))
            guest.City = member.City.Trim();
        if (string.IsNullOrEmpty(guest.State) && !string.IsNullOrEmpty(member.State))
            guest.State = member.State.Trim();
        if (string.IsNullOrEmpty(guest.PostalCode) && !string.IsNullOrEmpty(member.PostalCode))
            guest.PostalCode = member.PostalCode.Trim();
        if (string.IsNullOrEmpty(guest.Country) && !string.IsNullOrEmpty(member.Country))
            guest.Country = member.Country.Trim();

        // Phones - update if not set
        if (string.IsNullOrEmpty(guest.MobilePhone) && !string.IsNullOrEmpty(member.MobilePhone))
            guest.MobilePhone = member.MobilePhone.Trim();
        if (string.IsNullOrEmpty(guest.Phone))
            guest.Phone = member.MobilePhone?.Trim() ?? member.SecondaryPhone?.Trim();

        // Legacy IDs - always update if available
        if (!guest.LegacyId.HasValue && member.LegacyId > 0)
            guest.LegacyId = member.LegacyId;
        if (!guest.PmsUserId.HasValue && member.PmsUserId > 0)
            guest.PmsUserId = member.PmsUserId;
        if (!guest.UmbracoMemberId.HasValue && member.MemberId > 0)
            guest.UmbracoMemberId = member.MemberId;

        // Legacy password - only update if current user doesn't have a password
        if (string.IsNullOrEmpty(guest.PasswordHash) &&
            member.LegacyPasswordSalt != null && member.LegacyPasswordSalt.Length > 0 &&
            member.LegacyPasswordKey != null && member.LegacyPasswordKey.Length > 0)
        {
            guest.LegacyPasswordSalt = member.GetPasswordSaltBase64();
            guest.LegacyPasswordKey = member.GetPasswordKeyBase64();
            guest.AllowLoginWithLegacyPassword = true;
        }

        guest.UpdatedAt = DateTime.UtcNow;
    }
}
