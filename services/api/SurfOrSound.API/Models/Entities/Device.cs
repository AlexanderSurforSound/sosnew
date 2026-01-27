namespace SurfOrSound.API.Models.Entities;

public class Device
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PropertyTrackId { get; set; } = "";
    public string ExternalDeviceId { get; set; } = "";
    public string DeviceType { get; set; } = ""; // lock, thermostat, sensor
    public string Name { get; set; } = "";
    public string? Location { get; set; } // front_door, back_door, garage
    public string Status { get; set; } = "unknown"; // online, offline, low_battery
    public string? Manufacturer { get; set; } // RemoteLock, PointCentral, Ecobee
    public DateTime? LastStatusAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class DeviceAccessCode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DeviceId { get; set; }
    public string ReservationTrackId { get; set; } = "";
    public string AccessCode { get; set; } = "";
    public string? GuestName { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
