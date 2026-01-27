using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Integrations.Track;
using SurfOrSound.API.Models.DTOs;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Services;

public interface IDeviceService
{
    Task<List<DeviceDto>> GetReservationDevicesAsync(string reservationId, Guid userId);
    Task UnlockDeviceAsync(Guid deviceId, Guid userId);
    Task LockDeviceAsync(Guid deviceId, Guid userId);
    Task SetThermostatAsync(Guid deviceId, int temperature, Guid userId);
}

public record DeviceDto
{
    public Guid Id { get; init; }
    public string PropertyTrackId { get; init; } = "";
    public string DeviceType { get; init; } = "";
    public string Name { get; init; } = "";
    public string? Location { get; init; }
    public string Status { get; init; } = "";
    public int? CurrentTemp { get; init; }
    public int? TargetTemp { get; init; }
}

public class DeviceService : IDeviceService
{
    private readonly AppDbContext _db;
    private readonly ITrackClient _trackClient;
    private readonly ILogger<DeviceService> _logger;

    public DeviceService(AppDbContext db, ITrackClient trackClient, ILogger<DeviceService> logger)
    {
        _db = db;
        _trackClient = trackClient;
        _logger = logger;
    }

    public async Task<List<DeviceDto>> GetReservationDevicesAsync(string reservationId, Guid userId)
    {
        // Get reservation to verify ownership and get property ID
        var guest = await _db.Guests.FindAsync(userId);
        if (guest == null)
            throw new UnauthorizedAccessException("User not found");

        var reservation = await _trackClient.GetReservationAsync(reservationId);
        if (reservation == null)
            throw new KeyNotFoundException("Reservation not found");

        // Verify ownership
        if (guest.TrackGuestId != reservation.GuestId)
            throw new UnauthorizedAccessException("Not authorized to access this reservation");

        // Check if within check-in window (day before to day after checkout)
        var now = DateTime.UtcNow;
        var checkInStart = reservation.CheckIn.AddDays(-1);
        var checkOutEnd = reservation.CheckOut.AddDays(1);

        if (now < checkInStart || now > checkOutEnd)
            throw new InvalidOperationException("Device access is only available during your stay");

        // Get devices for this property
        var devices = await _db.Devices
            .Where(d => d.PropertyTrackId == reservation.PropertyId)
            .ToListAsync();

        return devices.Select(d => new DeviceDto
        {
            Id = d.Id,
            PropertyTrackId = d.PropertyTrackId,
            DeviceType = d.DeviceType,
            Name = d.Name,
            Location = d.Location,
            Status = d.Status
        }).ToList();
    }

    public async Task UnlockDeviceAsync(Guid deviceId, Guid userId)
    {
        var device = await _db.Devices.FindAsync(deviceId);
        if (device == null)
            throw new KeyNotFoundException("Device not found");

        if (device.DeviceType != "lock")
            throw new InvalidOperationException("Device is not a lock");

        // Verify user has access to this property via an active reservation
        await VerifyDeviceAccessAsync(device.PropertyTrackId, userId);

        // Call device API to unlock (would integrate with RemoteLock/PointCentral)
        _logger.LogInformation("Unlocking device {DeviceId} for user {UserId}", deviceId, userId);

        // In production, this would call the actual lock API
        // await _remoteLockClient.UnlockAsync(device.ExternalDeviceId);
    }

    public async Task LockDeviceAsync(Guid deviceId, Guid userId)
    {
        var device = await _db.Devices.FindAsync(deviceId);
        if (device == null)
            throw new KeyNotFoundException("Device not found");

        if (device.DeviceType != "lock")
            throw new InvalidOperationException("Device is not a lock");

        await VerifyDeviceAccessAsync(device.PropertyTrackId, userId);

        _logger.LogInformation("Locking device {DeviceId} for user {UserId}", deviceId, userId);
    }

    public async Task SetThermostatAsync(Guid deviceId, int temperature, Guid userId)
    {
        var device = await _db.Devices.FindAsync(deviceId);
        if (device == null)
            throw new KeyNotFoundException("Device not found");

        if (device.DeviceType != "thermostat")
            throw new InvalidOperationException("Device is not a thermostat");

        await VerifyDeviceAccessAsync(device.PropertyTrackId, userId);

        // Validate temperature range (60-80 F typically allowed for guests)
        if (temperature < 60 || temperature > 80)
            throw new ArgumentException("Temperature must be between 60 and 80 degrees");

        _logger.LogInformation("Setting thermostat {DeviceId} to {Temperature}F for user {UserId}",
            deviceId, temperature, userId);
    }

    private async Task VerifyDeviceAccessAsync(string propertyTrackId, Guid userId)
    {
        var guest = await _db.Guests.FindAsync(userId);
        if (guest == null || string.IsNullOrEmpty(guest.TrackGuestId))
            throw new UnauthorizedAccessException("User not found");

        // Get user's active reservations for this property
        var reservations = await _trackClient.GetReservationsAsync(guestId: guest.TrackGuestId, propertyId: propertyTrackId);

        var now = DateTime.UtcNow;
        var hasAccess = reservations.Any(r =>
            r.PropertyId == propertyTrackId &&
            now >= r.CheckIn.AddDays(-1) &&
            now <= r.CheckOut.AddDays(1) &&
            r.Status != "cancelled");

        if (!hasAccess)
            throw new UnauthorizedAccessException("No active reservation for this property");
    }
}
