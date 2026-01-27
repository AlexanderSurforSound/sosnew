-- =============================================
-- Property Export Query for Surf or Sound
--
-- Run this against your Umbraco database to export
-- property data for the new website.
--
-- This query extracts property content from Umbraco's
-- content tables and formats it for JSON export.
-- =============================================

-- Option 1: Simple property list with basic info
-- (Run this first to see what properties you have)

SELECT
    n.id AS UmbracoNodeId,
    n.text AS PropertyName,
    CASE
        WHEN pd_hn.textValue IS NOT NULL THEN pd_hn.textValue
        WHEN pd_hn.varcharValue IS NOT NULL THEN pd_hn.varcharValue
        ELSE CAST(pd_hn.intValue AS VARCHAR(10))
    END AS HouseNumber,
    CASE
        WHEN pd_active.intValue = 1 THEN 'Active'
        ELSE 'Inactive'
    END AS Status,
    n.createDate AS CreatedDate,
    n.nodeUser AS CreatedBy
FROM umbracoNode n
INNER JOIN umbracoContent c ON n.id = c.nodeId
INNER JOIN cmsContentType ct ON c.contentTypeId = ct.nodeId
LEFT JOIN umbracoPropertyData pd_hn ON c.nodeId = pd_hn.contentNodeId
    AND pd_hn.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'houseNumber')
LEFT JOIN umbracoPropertyData pd_active ON c.nodeId = pd_active.contentNodeId
    AND pd_active.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'active')
WHERE ct.alias = 'property'
    AND n.trashed = 0
ORDER BY
    CASE
        WHEN pd_hn.textValue IS NOT NULL THEN CAST(pd_hn.textValue AS INT)
        WHEN pd_hn.varcharValue IS NOT NULL THEN CAST(pd_hn.varcharValue AS INT)
        ELSE pd_hn.intValue
    END;

-- =============================================
-- Option 2: Full property export for JSON conversion
-- This includes more details needed for the new site
-- =============================================

/*
SELECT
    n.id AS id,
    n.text AS name,
    LOWER(REPLACE(REPLACE(n.text, ' ', '-'), '''', '')) AS slug,
    COALESCE(pd_hn.textValue, pd_hn.varcharValue, CAST(pd_hn.intValue AS VARCHAR(10))) AS houseNumber,
    pd_desc.textValue AS description,
    pd_short.textValue AS shortDescription,
    pd_village.textValue AS villageName,
    COALESCE(pd_minRate.decimalValue, 0) AS minWeeklyRate,
    COALESCE(pd_maxRate.decimalValue, 0) AS maxWeeklyRate,
    pd_active.intValue AS isActive
FROM umbracoNode n
INNER JOIN umbracoContent c ON n.id = c.nodeId
INNER JOIN cmsContentType ct ON c.contentTypeId = ct.nodeId
LEFT JOIN umbracoPropertyData pd_hn ON c.nodeId = pd_hn.contentNodeId
    AND pd_hn.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'houseNumber')
LEFT JOIN umbracoPropertyData pd_desc ON c.nodeId = pd_desc.contentNodeId
    AND pd_desc.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'longDescription')
LEFT JOIN umbracoPropertyData pd_short ON c.nodeId = pd_short.contentNodeId
    AND pd_short.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'shortDescription')
LEFT JOIN umbracoPropertyData pd_village ON c.nodeId = pd_village.contentNodeId
    AND pd_village.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'village')
LEFT JOIN umbracoPropertyData pd_minRate ON c.nodeId = pd_minRate.contentNodeId
    AND pd_minRate.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'minWeeklyRate')
LEFT JOIN umbracoPropertyData pd_maxRate ON c.nodeId = pd_maxRate.contentNodeId
    AND pd_maxRate.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'maxWeeklyRate')
LEFT JOIN umbracoPropertyData pd_active ON c.nodeId = pd_active.contentNodeId
    AND pd_active.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'active')
WHERE ct.alias = 'property'
    AND n.trashed = 0
    AND pd_active.intValue = 1
ORDER BY CAST(COALESCE(pd_hn.textValue, pd_hn.varcharValue, CAST(pd_hn.intValue AS VARCHAR(10))) AS INT);
*/

-- =============================================
-- Option 3: Export as JSON (SQL Server 2016+)
-- Copy the result directly into your mockData.ts
-- =============================================

/*
SELECT (
    SELECT
        n.id AS id,
        n.text AS name,
        LOWER(REPLACE(REPLACE(n.text, ' ', '-'), '''', '')) AS slug,
        COALESCE(pd_hn.textValue, pd_hn.varcharValue, CAST(pd_hn.intValue AS VARCHAR(10))) AS houseNumber,
        pd_active.intValue AS isActive
    FROM umbracoNode n
    INNER JOIN umbracoContent c ON n.id = c.nodeId
    INNER JOIN cmsContentType ct ON c.contentTypeId = ct.nodeId
    LEFT JOIN umbracoPropertyData pd_hn ON c.nodeId = pd_hn.contentNodeId
        AND pd_hn.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'houseNumber')
    LEFT JOIN umbracoPropertyData pd_active ON c.nodeId = pd_active.contentNodeId
        AND pd_active.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'active')
    WHERE ct.alias = 'property'
        AND n.trashed = 0
        AND pd_active.intValue = 1
    FOR JSON PATH
) AS PropertiesJson;
*/
