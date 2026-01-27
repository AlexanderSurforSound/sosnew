-- ============================================================
-- PMS Users Full Export for Surf or Sound Migration
-- ============================================================
--
-- This query extracts members from the pmsUsers table by decompressing
-- the GZip-compressed JSON data stored in the Json column.
--
-- IMPORTANT: Run in batches due to query timeout limits.
-- Save each batch output as JSON, then combine using combine-exports.ps1
--
-- After combining, use the migration endpoint to import:
--   POST /api/v1/admin/migration/members/import-file?filePath=C:/path/to/members-export-combined.json
--   Header: X-Admin-Key: YOUR_ADMIN_KEY
--
-- ============================================================

-- First, check total count of valid records
/*
SELECT COUNT(*) AS ValidCount
FROM pmsUsers u
WHERE u.Json IS NOT NULL
  AND ISJSON(CAST(DECOMPRESS(u.Json) AS VARCHAR(MAX))) = 1;
*/

-- ============================================================
-- BATCH EXPORT QUERIES
-- Run each batch separately and save as JSON file
-- ============================================================

-- Batch 1: First 50,000 records (OFFSET 0)
SELECT
    u.ID AS Id, u.ID AS MemberId,
    JSON_VALUE(j.Data, '$.Email') AS Email,
    JSON_VALUE(j.Data, '$.FirstName') AS FirstName,
    JSON_VALUE(j.Data, '$.LastName') AS LastName,
    JSON_VALUE(j.Data, '$.Address.Address1') AS AddressLine1,
    JSON_VALUE(j.Data, '$.Address.City') AS City,
    JSON_VALUE(j.Data, '$.Address.State') AS State,
    JSON_VALUE(j.Data, '$.Address.Zip') AS PostalCode,
    JSON_VALUE(j.Data, '$.MobilePhone') AS MobilePhone,
    u.PMSUserID AS PmsUserId,
    JSON_QUERY(j.Data, '$.PwdSalt') AS LegacyPasswordSalt,
    JSON_QUERY(j.Data, '$.PwdKey') AS LegacyPasswordKey,
    u.LastLogin,
    u.Created AS CreatedDate
FROM pmsUsers u
CROSS APPLY (SELECT CAST(DECOMPRESS(u.Json) AS VARCHAR(MAX)) AS Data) j
WHERE ISJSON(j.Data) = 1 AND JSON_VALUE(j.Data, '$.Email') != ''
ORDER BY u.ID
OFFSET 0 ROWS FETCH NEXT 50000 ROWS ONLY
FOR JSON PATH;

-- Batch 2: Records 50,001-100,000 (OFFSET 50000)
/*
SELECT
    u.ID AS Id, u.ID AS MemberId,
    JSON_VALUE(j.Data, '$.Email') AS Email,
    JSON_VALUE(j.Data, '$.FirstName') AS FirstName,
    JSON_VALUE(j.Data, '$.LastName') AS LastName,
    JSON_VALUE(j.Data, '$.Address.Address1') AS AddressLine1,
    JSON_VALUE(j.Data, '$.Address.City') AS City,
    JSON_VALUE(j.Data, '$.Address.State') AS State,
    JSON_VALUE(j.Data, '$.Address.Zip') AS PostalCode,
    JSON_VALUE(j.Data, '$.MobilePhone') AS MobilePhone,
    u.PMSUserID AS PmsUserId,
    JSON_QUERY(j.Data, '$.PwdSalt') AS LegacyPasswordSalt,
    JSON_QUERY(j.Data, '$.PwdKey') AS LegacyPasswordKey,
    u.LastLogin,
    u.Created AS CreatedDate
FROM pmsUsers u
CROSS APPLY (SELECT CAST(DECOMPRESS(u.Json) AS VARCHAR(MAX)) AS Data) j
WHERE ISJSON(j.Data) = 1 AND JSON_VALUE(j.Data, '$.Email') != ''
ORDER BY u.ID
OFFSET 50000 ROWS FETCH NEXT 50000 ROWS ONLY
FOR JSON PATH;
*/

-- Batch 3: Records 100,001-150,000 (OFFSET 100000)
/*
SELECT
    u.ID AS Id, u.ID AS MemberId,
    JSON_VALUE(j.Data, '$.Email') AS Email,
    JSON_VALUE(j.Data, '$.FirstName') AS FirstName,
    JSON_VALUE(j.Data, '$.LastName') AS LastName,
    JSON_VALUE(j.Data, '$.Address.Address1') AS AddressLine1,
    JSON_VALUE(j.Data, '$.Address.City') AS City,
    JSON_VALUE(j.Data, '$.Address.State') AS State,
    JSON_VALUE(j.Data, '$.Address.Zip') AS PostalCode,
    JSON_VALUE(j.Data, '$.MobilePhone') AS MobilePhone,
    u.PMSUserID AS PmsUserId,
    JSON_QUERY(j.Data, '$.PwdSalt') AS LegacyPasswordSalt,
    JSON_QUERY(j.Data, '$.PwdKey') AS LegacyPasswordKey,
    u.LastLogin,
    u.Created AS CreatedDate
FROM pmsUsers u
CROSS APPLY (SELECT CAST(DECOMPRESS(u.Json) AS VARCHAR(MAX)) AS Data) j
WHERE ISJSON(j.Data) = 1 AND JSON_VALUE(j.Data, '$.Email') != ''
ORDER BY u.ID
OFFSET 100000 ROWS FETCH NEXT 50000 ROWS ONLY
FOR JSON PATH;
*/

-- Last batch from end (most recent 20,000 records by DESC order)
-- Use this to get remaining records if OFFSET queries timeout
/*
SELECT
    u.ID AS Id, u.ID AS MemberId,
    JSON_VALUE(j.Data, '$.Email') AS Email,
    JSON_VALUE(j.Data, '$.FirstName') AS FirstName,
    JSON_VALUE(j.Data, '$.LastName') AS LastName,
    JSON_VALUE(j.Data, '$.Address.Address1') AS AddressLine1,
    JSON_VALUE(j.Data, '$.Address.City') AS City,
    JSON_VALUE(j.Data, '$.Address.State') AS State,
    JSON_VALUE(j.Data, '$.Address.Zip') AS PostalCode,
    JSON_VALUE(j.Data, '$.MobilePhone') AS MobilePhone,
    u.PMSUserID AS PmsUserId,
    JSON_QUERY(j.Data, '$.PwdSalt') AS LegacyPasswordSalt,
    JSON_QUERY(j.Data, '$.PwdKey') AS LegacyPasswordKey,
    u.LastLogin,
    u.Created AS CreatedDate
FROM pmsUsers u
CROSS APPLY (SELECT CAST(DECOMPRESS(u.Json) AS VARCHAR(MAX)) AS Data) j
WHERE ISJSON(j.Data) = 1 AND JSON_VALUE(j.Data, '$.Email') != ''
ORDER BY u.ID DESC
OFFSET 0 ROWS FETCH NEXT 20000 ROWS ONLY
FOR JSON PATH;
*/
