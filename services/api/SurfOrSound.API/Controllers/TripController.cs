using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers;

[ApiController]
[Route("api/v1/trips")]
[Authorize]
public class TripController : ControllerBase
{
    private readonly ITripService _tripService;
    private readonly ILogger<TripController> _logger;

    public TripController(ITripService tripService, ILogger<TripController> logger)
    {
        _tripService = tripService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Empty;
    }

    /// <summary>
    /// Get all upcoming trips for the authenticated user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<TripSummaryDto>>> GetUpcomingTrips()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var trips = await _tripService.GetUpcomingTripsAsync(userId);
        return Ok(trips);
    }

    /// <summary>
    /// Get the full trip dashboard for a specific reservation
    /// </summary>
    [HttpGet("{reservationId}")]
    public async Task<ActionResult<TripDashboardDto>> GetTripDashboard(string reservationId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var dashboard = await _tripService.GetTripDashboardAsync(reservationId, userId);
        if (dashboard == null)
            return NotFound(new { message = "Trip not found or access denied" });

        return Ok(dashboard);
    }
}
