-- ============================================================
-- Umbraco 10 Member Export for Surf or Sound Migration
-- ============================================================
--
-- Run this against the Umbraco database and save output as members-export.json
-- Then use the migration endpoint to import:
--   POST /api/v1/admin/migration/members/import-file?filePath=C:/path/to/members-export.json
--   Header: X-Admin-Key: YOUR_ADMIN_KEY
--
-- ============================================================

SELECT
    m.nodeId AS Id,
    m.nodeId AS MemberId,
    m.Email,

    -- Property values from Umbraco 10 property data
    props.firstName AS FirstName,
    props.lastName AS LastName,
    props.addressLine1 AS AddressLine1,
    props.addressLine2 AS AddressLine2,
    props.city AS City,
    props.state AS State,
    props.postalCode AS PostalCode,
    props.country AS Country,
    props.mobilePhone AS MobilePhone,
    props.secondaryPhone AS SecondaryPhone,
    ISNULL(props.legacyId, 0) AS LegacyId,
    ISNULL(props.pmsUserId, 0) AS PmsUserId,
    ISNULL(props.pmsAgentID, 0) AS PmsAgentId,
    props.legacyPasswordSalt AS LegacyPasswordSalt,
    props.legacyPasswordKey AS LegacyPasswordKey,
    ISNULL(props.allowLoginWithLegacyPassword, 0) AS AllowLoginWithLegacyPassword,
    ISNULL(props.emailMarketingOptIn, 0) AS EmailMarketingOptIn,
    props.favoriteHomes AS FavoriteHomes,
    ISNULL(props.inactive, 0) AS Inactive,
    m.isLockedOut AS IsLockedOut,
    props.legacyLastLogin AS LastLogin,
    n.createDate AS CreatedDate

FROM cmsMember m
INNER JOIN umbracoNode n ON m.nodeId = n.id
CROSS APPLY (
    SELECT
        MAX(CASE WHEN pt.alias = 'firstName' THEN pd.varcharValue END) AS firstName,
        MAX(CASE WHEN pt.alias = 'lastName' THEN pd.varcharValue END) AS lastName,
        MAX(CASE WHEN pt.alias = 'addressLine1' THEN pd.varcharValue END) AS addressLine1,
        MAX(CASE WHEN pt.alias = 'addressLine2' THEN pd.varcharValue END) AS addressLine2,
        MAX(CASE WHEN pt.alias = 'city' THEN pd.varcharValue END) AS city,
        MAX(CASE WHEN pt.alias = 'state' THEN pd.varcharValue END) AS state,
        MAX(CASE WHEN pt.alias = 'postalCode' THEN pd.varcharValue END) AS postalCode,
        MAX(CASE WHEN pt.alias = 'country' THEN pd.varcharValue END) AS country,
        MAX(CASE WHEN pt.alias = 'mobilePhone' THEN pd.varcharValue END) AS mobilePhone,
        MAX(CASE WHEN pt.alias = 'secondaryPhone' THEN pd.varcharValue END) AS secondaryPhone,
        MAX(CASE WHEN pt.alias = 'legacyId' THEN pd.intValue END) AS legacyId,
        MAX(CASE WHEN pt.alias = 'pmsUserId' THEN pd.intValue END) AS pmsUserId,
        MAX(CASE WHEN pt.alias = 'pmsAgentID' THEN pd.intValue END) AS pmsAgentID,
        MAX(CASE WHEN pt.alias = 'legacyPasswordSalt' THEN pd.textValue END) AS legacyPasswordSalt,
        MAX(CASE WHEN pt.alias = 'legacyPasswordKey' THEN pd.textValue END) AS legacyPasswordKey,
        MAX(CASE WHEN pt.alias = 'allowLoginWithLegacyPassword' THEN pd.intValue END) AS allowLoginWithLegacyPassword,
        MAX(CASE WHEN pt.alias = 'emailMarketingOptIn' THEN pd.intValue END) AS emailMarketingOptIn,
        MAX(CASE WHEN pt.alias = 'favoriteHomes' THEN pd.textValue END) AS favoriteHomes,
        MAX(CASE WHEN pt.alias = 'inactive' THEN pd.intValue END) AS inactive,
        MAX(CASE WHEN pt.alias = 'legacyLastLogin' THEN pd.dateValue END) AS legacyLastLogin
    FROM umbracoPropertyData pd
    INNER JOIN cmsPropertyType pt ON pd.propertyTypeId = pt.id
    INNER JOIN umbracoContentVersion cv ON pd.versionId = cv.id
    WHERE cv.nodeId = m.nodeId
      AND cv.[current] = 1
    GROUP BY cv.nodeId
) props
WHERE n.trashed = 0
ORDER BY n.createDate
FOR JSON PATH;


-- ============================================================
-- Alternative: Get count first to verify
-- ============================================================
/*
SELECT COUNT(*) AS TotalMembers
FROM cmsMember m
INNER JOIN umbracoNode n ON m.nodeId = n.id
WHERE n.trashed = 0;
*/
