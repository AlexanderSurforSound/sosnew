-- =============================================
-- Rate Export Query for Surf or Sound
--
-- Run this against your Umbraco database to export
-- rate data for all properties.
--
-- Copy the JSON result to: tools/umbraco-rates.json
-- =============================================

-- Export rates as JSON
SELECT (
    SELECT
        n.id AS umbracoId,
        n.text AS name,
        COALESCE(pd_hn.textValue, pd_hn.varcharValue, CAST(pd_hn.intValue AS VARCHAR(10))) AS houseNumber,
        COALESCE(pd_minRate.decimalValue, 0) AS minWeeklyRate,
        COALESCE(pd_maxRate.decimalValue, 0) AS maxWeeklyRate,
        pd_rates.textValue AS rateScheduleJson
    FROM umbracoNode n
    INNER JOIN umbracoContent c ON n.id = c.nodeId
    INNER JOIN cmsContentType ct ON c.contentTypeId = ct.nodeId
    LEFT JOIN umbracoPropertyData pd_hn ON c.nodeId = pd_hn.contentNodeId
        AND pd_hn.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'houseNumber')
    LEFT JOIN umbracoPropertyData pd_minRate ON c.nodeId = pd_minRate.contentNodeId
        AND pd_minRate.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'minWeeklyRate')
    LEFT JOIN umbracoPropertyData pd_maxRate ON c.nodeId = pd_maxRate.contentNodeId
        AND pd_maxRate.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias = 'maxWeeklyRate')
    LEFT JOIN umbracoPropertyData pd_rates ON c.nodeId = pd_rates.contentNodeId
        AND pd_rates.propertyTypeId = (SELECT id FROM cmsPropertyType WHERE alias IN ('rates', 'rateSchedule', 'weeklyRates'))
    WHERE ct.alias = 'property'
        AND n.trashed = 0
    ORDER BY n.text
    FOR JSON PATH
) AS RatesJson;

-- =============================================
-- Alternative: If rates are in a separate table
-- =============================================
/*
SELECT (
    SELECT
        p.houseNumber,
        p.propertyName,
        r.seasonName,
        r.startDate,
        r.endDate,
        r.weeklyRate,
        r.nightlyRate,
        r.minimumNights
    FROM PropertyRates r
    INNER JOIN Properties p ON r.propertyId = p.id
    WHERE p.isActive = 1
    ORDER BY p.houseNumber, r.startDate
    FOR JSON PATH
) AS RatesJson;
*/

-- =============================================
-- Query to check what rate-related fields exist
-- =============================================
/*
SELECT alias, name, dataTypeId
FROM cmsPropertyType
WHERE alias LIKE '%rate%'
   OR alias LIKE '%price%'
   OR alias LIKE '%cost%'
   OR alias LIKE '%weekly%'
ORDER BY alias;
*/
