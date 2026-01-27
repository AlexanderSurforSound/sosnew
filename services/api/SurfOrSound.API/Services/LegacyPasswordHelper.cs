using System.Security.Cryptography;

namespace SurfOrSound.API.Services;

/// <summary>
/// Handles legacy password validation for migrated Umbraco members.
/// Legacy passwords use PBKDF2 (Rfc2898DeriveBytes) with a 16-byte salt and 16-byte key.
/// </summary>
public static class LegacyPasswordHelper
{
    /// <summary>
    /// Validates a password against legacy Umbraco password hash.
    /// The legacy system stores salt and key as base64 strings.
    /// </summary>
    /// <param name="password">The plain text password to validate</param>
    /// <param name="legacyPasswordSalt">Base64 encoded salt from Umbraco</param>
    /// <param name="legacyPasswordKey">Base64 encoded key from Umbraco</param>
    /// <returns>True if password is valid</returns>
    public static bool ValidateLegacyPassword(string password, string legacyPasswordSalt, string legacyPasswordKey)
    {
        if (string.IsNullOrEmpty(password) ||
            string.IsNullOrEmpty(legacyPasswordSalt) ||
            string.IsNullOrEmpty(legacyPasswordKey))
        {
            return false;
        }

        try
        {
            var salt = Convert.FromBase64String(legacyPasswordSalt);
            var expectedKey = Convert.FromBase64String(legacyPasswordKey);

            // Use PBKDF2 with SHA1 (default for Rfc2898DeriveBytes in .NET Framework)
            // The legacy Umbraco system uses 1000 iterations by default
            using var deriveBytes = new Rfc2898DeriveBytes(password, salt, 1000, HashAlgorithmName.SHA1);
            var computedKey = deriveBytes.GetBytes(16);

            return CryptographicOperations.FixedTimeEquals(computedKey, expectedKey);
        }
        catch
        {
            // Invalid base64 or other crypto errors
            return false;
        }
    }

    /// <summary>
    /// Generates a new legacy-compatible password hash.
    /// Used only for testing/migration purposes.
    /// </summary>
    public static (string Salt, string Key) GenerateLegacyHash(string password)
    {
        using var deriveBytes = new Rfc2898DeriveBytes(password, 16, 1000, HashAlgorithmName.SHA1);
        return (
            Convert.ToBase64String(deriveBytes.Salt),
            Convert.ToBase64String(deriveBytes.GetBytes(16))
        );
    }
}
