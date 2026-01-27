using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers;

[ApiController]
[Route("api/v1/devices")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;
    private readonly ILogger<DevicesController> _logger;

    public DevicesController(IDeviceService deviceService, ILogger<DevicesController> logger)
    {
        _deviceService = deviceService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : throw new UnauthorizedAccessException();
    }

    /// <summary>
    /// Unlock a smart lock
    /// </summary>
    [HttpPost("{id}/unlock")]
    public async Task<ActionResult> UnlockDevice(Guid id)
    {
        try
        {
            await _deviceService.UnlockDeviceAsync(id, GetUserId());
            return Ok(new { message = "Device unlocked successfully" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Device not found" });
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

    /// <summary>
    /// Lock a smart lock
    /// </summary>
    [HttpPost("{id}/lock")]
    public async Task<ActionResult> LockDevice(Guid id)
    {
        try
        {
            await _deviceService.LockDeviceAsync(id, GetUserId());
            return Ok(new { message = "Device locked successfully" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Device not found" });
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

    /// <summary>
    /// Set thermostat temperature
    /// </summary>
    [HttpPut("{id}/thermostat")]
    public async Task<ActionResult> SetThermostat(Guid id, [FromBody] ThermostatRequest request)
    {
        try
        {
            await _deviceService.SetThermostatAsync(id, request.Temperature, GetUserId());
            return Ok(new { message = $"Thermostat set to {request.Temperature}F" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Device not found" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record ThermostatRequest(int Temperature);
