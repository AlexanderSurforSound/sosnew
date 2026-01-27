using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Models.DTOs;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers;

[ApiController]
[Route("api/v1/properties")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _propertyService;
    private readonly IAIService _aiService;
    private readonly ILogger<PropertiesController> _logger;

    public PropertiesController(
        IPropertyService propertyService,
        IAIService aiService,
        ILogger<PropertiesController> logger)
    {
        _propertyService = propertyService;
        _aiService = aiService;
        _logger = logger;
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }

    /// <summary>
    /// Get paginated list of properties with optional filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<PropertyDto>>> GetProperties(
        [FromQuery] string? village,
        [FromQuery] int? minBedrooms,
        [FromQuery] int? maxBedrooms,
        [FromQuery] string? checkIn,
        [FromQuery] string? checkOut,
        [FromQuery] int? guests,
        [FromQuery] string? amenities,
        [FromQuery] bool? petFriendly,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
        [FromQuery] string? sortBy = null)
    {
        var query = new PropertyQueryParams
        {
            Village = village,
            MinBedrooms = minBedrooms,
            MaxBedrooms = maxBedrooms,
            CheckIn = checkIn,
            CheckOut = checkOut,
            Guests = guests,
            Amenities = amenities?.Split(',').ToList(),
            PetFriendly = petFriendly,
            Page = page,
            PageSize = Math.Min(pageSize, 100),
            SortBy = sortBy
        };

        var result = await _propertyService.GetPropertiesAsync(query, GetUserId());
        return Ok(result);
    }

    /// <summary>
    /// Get featured properties for homepage
    /// </summary>
    [HttpGet("featured")]
    public async Task<ActionResult<List<PropertyDto>>> GetFeaturedProperties([FromQuery] int limit = 6)
    {
        var properties = await _propertyService.GetFeaturedPropertiesAsync(Math.Min(limit, 12));
        return Ok(properties);
    }

    /// <summary>
    /// Search properties by name or location
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<PropertyDto>>> SearchProperties([FromQuery] string q, [FromQuery] int limit = 20)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(new List<PropertyDto>());

        var properties = await _propertyService.SearchPropertiesAsync(q, Math.Min(limit, 50));
        return Ok(properties);
    }

    /// <summary>
    /// Get property details by slug
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<PropertyDetailDto>> GetProperty(string slug)
    {
        var property = await _propertyService.GetPropertyBySlugAsync(slug, GetUserId());
        if (property == null)
            return NotFound(new { message = "Property not found" });

        return Ok(property);
    }

    /// <summary>
    /// Get property availability for date range
    /// </summary>
    [HttpGet("{slug}/availability")]
    public async Task<ActionResult<AvailabilityDto>> GetAvailability(
        string slug,
        [FromQuery] string start,
        [FromQuery] string end)
    {
        if (!DateTime.TryParse(start, out var startDate) || !DateTime.TryParse(end, out var endDate))
            return BadRequest(new { message = "Invalid date format. Use yyyy-MM-dd" });

        if (endDate <= startDate)
            return BadRequest(new { message = "End date must be after start date" });

        if ((endDate - startDate).TotalDays > 365)
            return BadRequest(new { message = "Date range cannot exceed 365 days" });

        try
        {
            var availability = await _propertyService.GetAvailabilityAsync(slug, startDate, endDate);
            return Ok(availability);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get pricing for a property and date range
    /// </summary>
    [HttpGet("{slug}/pricing")]
    public async Task<ActionResult<PricingDto>> GetPricing(
        string slug,
        [FromQuery] string start,
        [FromQuery] string end,
        [FromQuery] int guests = 2)
    {
        if (!DateTime.TryParse(start, out var startDate) || !DateTime.TryParse(end, out var endDate))
            return BadRequest(new { message = "Invalid date format. Use yyyy-MM-dd" });

        try
        {
            var pricing = await _propertyService.GetPricingAsync(slug, startDate, endDate, guests);
            return Ok(pricing);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// AI Dream Matcher - Find properties matching natural language description
    /// </summary>
    [HttpPost("dream-match")]
    public async Task<ActionResult<DreamMatcherResponse>> DreamMatch([FromBody] DreamMatcherRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Query) || request.Query.Length < 10)
            return BadRequest(new { message = "Please describe your dream vacation in more detail (at least 10 characters)" });

        if (request.Query.Length > 1000)
            return BadRequest(new { message = "Description is too long. Please keep it under 1000 characters" });

        try
        {
            var result = await _aiService.MatchDreamVacationAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dream match failed for query: {Query}", request.Query);
            return StatusCode(500, new { message = "Failed to process your dream vacation request. Please try again." });
        }
    }
}
