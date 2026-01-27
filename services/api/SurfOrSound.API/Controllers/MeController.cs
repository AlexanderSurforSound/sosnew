using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Models.DTOs;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers;

[ApiController]
[Route("api/v1/me")]
[Authorize]
public class MeController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IGuestService _guestService;
    private readonly ILogger<MeController> _logger;

    public MeController(IAuthService authService, IGuestService guestService, ILogger<MeController> logger)
    {
        _authService = authService;
        _guestService = guestService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : throw new UnauthorizedAccessException();
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        try
        {
            var user = await _authService.GetUserAsync(GetUserId());
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "User not found" });
        }
    }

    /// <summary>
    /// Update current user profile
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await _authService.UpdateUserAsync(GetUserId(), request);
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "User not found" });
        }
    }

    /// <summary>
    /// Get user's favorite properties
    /// </summary>
    [HttpGet("favorites")]
    public async Task<ActionResult<List<PropertyDto>>> GetFavorites()
    {
        var favorites = await _guestService.GetFavoritesAsync(GetUserId());
        return Ok(favorites);
    }

    /// <summary>
    /// Add a property to favorites
    /// </summary>
    [HttpPost("favorites/{propertyId}")]
    public async Task<ActionResult> AddFavorite(string propertyId)
    {
        await _guestService.AddFavoriteAsync(GetUserId(), propertyId);
        return NoContent();
    }

    /// <summary>
    /// Remove a property from favorites
    /// </summary>
    [HttpDelete("favorites/{propertyId}")]
    public async Task<ActionResult> RemoveFavorite(string propertyId)
    {
        await _guestService.RemoveFavoriteAsync(GetUserId(), propertyId);
        return NoContent();
    }

    /// <summary>
    /// Get user's loyalty status
    /// </summary>
    [HttpGet("loyalty")]
    public async Task<ActionResult> GetLoyalty()
    {
        var user = await _authService.GetUserAsync(GetUserId());

        return Ok(new
        {
            tier = user.LoyaltyTier,
            points = user.LoyaltyPoints,
            totalStays = user.TotalStays,
            nextTier = GetNextTier(user.LoyaltyTier),
            pointsToNextTier = GetPointsToNextTier(user.LoyaltyTier, user.LoyaltyPoints)
        });
    }

    private static string? GetNextTier(string currentTier)
    {
        return currentTier switch
        {
            "Explorer" => "Adventurer",
            "Adventurer" => "Islander",
            "Islander" => "Legend",
            _ => null
        };
    }

    private static int GetPointsToNextTier(string currentTier, int currentPoints)
    {
        var threshold = currentTier switch
        {
            "Explorer" => 1000,
            "Adventurer" => 5000,
            "Islander" => 15000,
            _ => 0
        };

        return Math.Max(0, threshold - currentPoints);
    }
}
