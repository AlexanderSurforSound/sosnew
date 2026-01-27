using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Models.DTOs;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers;

[ApiController]
[Route("api/v1/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;
    private readonly IDeviceService _deviceService;
    private readonly ILogger<ReservationsController> _logger;

    public ReservationsController(
        IReservationService reservationService,
        IDeviceService deviceService,
        ILogger<ReservationsController> logger)
    {
        _reservationService = reservationService;
        _deviceService = deviceService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : throw new UnauthorizedAccessException();
    }

    /// <summary>
    /// Create a new reservation with payment
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReservationDto>> CreateReservation([FromBody] CreateReservationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PropertyId))
            return BadRequest(new { message = "Property ID is required" });

        if (string.IsNullOrWhiteSpace(request.CheckIn) || string.IsNullOrWhiteSpace(request.CheckOut))
            return BadRequest(new { message = "Check-in and check-out dates are required" });

        if (request.Adults < 1)
            return BadRequest(new { message = "At least 1 adult is required" });

        try
        {
            var reservation = await _reservationService.CreateReservationAsync(request, GetUserId());
            return Created($"/api/v1/reservations/{reservation.Id}", reservation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create reservation");
            return BadRequest(new { message = "Failed to create reservation. Please try again." });
        }
    }

    /// <summary>
    /// Get current user's reservations
    /// </summary>
    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<List<ReservationDto>>> GetMyReservations()
    {
        var reservations = await _reservationService.GetUserReservationsAsync(GetUserId());
        return Ok(reservations);
    }

    /// <summary>
    /// Get reservation details
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ReservationDetailDto>> GetReservation(string id)
    {
        var reservation = await _reservationService.GetReservationAsync(id, GetUserId());
        if (reservation == null)
            return NotFound(new { message = "Reservation not found" });

        return Ok(reservation);
    }

    /// <summary>
    /// Get devices available for a reservation
    /// </summary>
    [HttpGet("{id}/devices")]
    [Authorize]
    public async Task<ActionResult<List<DeviceDto>>> GetReservationDevices(string id)
    {
        try
        {
            var devices = await _deviceService.GetReservationDevicesAsync(id, GetUserId());
            return Ok(devices);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Reservation not found" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
