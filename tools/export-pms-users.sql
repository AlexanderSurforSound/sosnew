-- ============================================================
-- PMS Users Export for Surf or Sound Migration
-- ============================================================
--
-- Run this against the Umbraco database and save output as members-export.json
-- Then use the migration endpoint to import:
--   POST /api/v1/admin/migration/members/import-file?filePath=C:/path/to/members-export.json
--   Header: X-Admin-Key: YOUR_ADMIN_KEY
--
-- NOTE: Password data is encrypted in the Json column and cannot be extracted.
--       Migrated users will need to use "Forgot Password" to set a new password.
--
-- ============================================================

SELECT
    ID AS Id,
    ID AS MemberId,

    -- Extract email from Name column (format: "email LastName")
    -- Email is the part containing '@'
    CASE
        WHEN CHARINDEX(' ', Name) > 0 AND CHARINDEX('@', Name) > 0 AND CHARINDEX('@', Name) < CHARINDEX(' ', Name)
        THEN LTRIM(RTRIM(LEFT(Name, CHARINDEX(' ', Name) - 1)))
        WHEN CHARINDEX('@', Name) > 0
        THEN LTRIM(RTRIM(Name))
        ELSE NULL
    END AS Email,

    -- Extract first name (not available - will be null)
    NULL AS FirstName,

    -- Extract last name from Name column (text after email)
    CASE
        WHEN CHARINDEX(' ', Name) > 0 AND CHARINDEX('@', Name) > 0 AND CHARINDEX('@', Name) < CHARINDEX(' ', Name)
        THEN LTRIM(RTRIM(SUBSTRING(Name, CHARINDEX(' ', Name) + 1, LEN(Name))))
        ELSE NULL
    END AS LastName,

    -- Address fields (not available in pmsUsers)
    NULL AS AddressLine1,
    NULL AS AddressLine2,
    NULL AS City,
    NULL AS State,
    NULL AS PostalCode,
    NULL AS Country,

    -- Phone
    Phone AS MobilePhone,
    NULL AS SecondaryPhone,

    -- Legacy IDs
    0 AS LegacyId,
    PMSUserID AS PmsUserId,
    0 AS PmsAgentId,

    -- Password fields (encrypted - cannot extract)
    NULL AS LegacyPasswordSalt,
    NULL AS LegacyPasswordKey,
    0 AS AllowLoginWithLegacyPassword,

    -- Preferences (not available)
    0 AS EmailMarketingOptIn,
    NULL AS FavoriteHomes,

    -- Status
    0 AS Inactive,
    0 AS IsLockedOut,

    -- Dates
    LastLogin AS LastLogin,
    Created AS CreatedDate

FROM pmsUsers
WHERE
    -- Only include records that have a valid email (contains @)
    CHARINDEX('@', Name) > 0
ORDER BY Created
FOR JSON PATH;


-- ============================================================
-- Alternative: Get count first to verify
-- ============================================================
/*
SELECT COUNT(*) AS TotalMembers
FROM pmsUsers
WHERE CHARINDEX('@', Name) > 0;
*/

-- ============================================================
-- Preview query (first 10 records without JSON)
-- ============================================================
/*
SELECT TOP 10
    ID,
    Name,
    CASE
        WHEN CHARINDEX(' ', Name) > 0 AND CHARINDEX('@', Name) > 0 AND CHARINDEX('@', Name) < CHARINDEX(' ', Name)
        THEN LTRIM(RTRIM(LEFT(Name, CHARINDEX(' ', Name) - 1)))
        WHEN CHARINDEX('@', Name) > 0
        THEN LTRIM(RTRIM(Name))
        ELSE NULL
    END AS ExtractedEmail,
    CASE
        WHEN CHARINDEX(' ', Name) > 0 AND CHARINDEX('@', Name) > 0 AND CHARINDEX('@', Name) < CHARINDEX(' ', Name)
        THEN LTRIM(RTRIM(SUBSTRING(Name, CHARINDEX(' ', Name) + 1, LEN(Name))))
        ELSE NULL
    END AS ExtractedLastName,
    Phone,
    PMSUserID,
    LastLogin,
    Created
FROM pmsUsers
WHERE CHARINDEX('@', Name) > 0
ORDER BY Created;
*/
