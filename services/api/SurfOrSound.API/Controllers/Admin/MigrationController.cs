using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Integrations.Umbraco;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers.Admin;

/// <summary>
/// Admin endpoints for data migration operations.
/// These endpoints should be secured and only accessible by administrators.
/// </summary>
[ApiController]
[Route("api/v1/admin/migration")]
// [Authorize(Roles = "Admin")] // Uncomment when auth is fully configured
public class MigrationController : ControllerBase
{
    private readonly IMemberMigrationService _migrationService;
    private readonly ILogger<MigrationController> _logger;
    private readonly IConfiguration _config;

    public MigrationController(
        IMemberMigrationService migrationService,
        ILogger<MigrationController> logger,
        IConfiguration config)
    {
        _migrationService = migrationService;
        _logger = logger;
        _config = config;
    }

    /// <summary>
    /// Import members from an Umbraco database export JSON file.
    /// </summary>
    /// <param name="filePath">Path to the JSON export file</param>
    /// <param name="updateExisting">Whether to update existing members (default: false)</param>
    [HttpPost("members/import-file")]
    public async Task<ActionResult<MemberMigrationResult>> ImportMembersFromFile(
        [FromQuery] string filePath,
        [FromQuery] bool updateExisting = false)
    {
        // Validate admin key for security
        var adminKey = Request.Headers["X-Admin-Key"].FirstOrDefault();
        var expectedKey = _config["AdminKey"];
        if (string.IsNullOrEmpty(expectedKey) || adminKey != expectedKey)
        {
            return Unauthorized(new { message = "Invalid admin key" });
        }

        try
        {
            _logger.LogInformation("Starting member import from file: {FilePath}", filePath);
            var result = await _migrationService.ImportFromJsonFileAsync(filePath, updateExisting);
            return Ok(result);
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Member import failed");
            return StatusCode(500, new { message = "Import failed", error = ex.Message });
        }
    }

    /// <summary>
    /// Import members from JSON content posted directly.
    /// </summary>
    [HttpPost("members/import")]
    public async Task<ActionResult<MemberMigrationResult>> ImportMembers(
        [FromBody] List<UmbracoMemberExport> members,
        [FromQuery] bool updateExisting = false)
    {
        // Validate admin key for security
        var adminKey = Request.Headers["X-Admin-Key"].FirstOrDefault();
        var expectedKey = _config["AdminKey"];
        if (string.IsNullOrEmpty(expectedKey) || adminKey != expectedKey)
        {
            return Unauthorized(new { message = "Invalid admin key" });
        }

        try
        {
            _logger.LogInformation("Starting member import of {Count} members", members.Count);
            var json = System.Text.Json.JsonSerializer.Serialize(members);
            var result = await _migrationService.ImportFromJsonAsync(json, updateExisting);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Member import failed");
            return StatusCode(500, new { message = "Import failed", error = ex.Message });
        }
    }
}
