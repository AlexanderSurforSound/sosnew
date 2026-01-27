using System.Text.Json.Serialization;

namespace SurfOrSound.API.Integrations.RemoteLock;

public class RemoteLockResponse<T>
{
    [JsonPropertyName("data")]
    public T? Data { get; set; }
}

public class RemoteLockListResponse<T>
{
    [JsonPropertyName("data")]
    public List<T> Data { get; set; } = new();

    [JsonPropertyName("meta")]
    public RemoteLockMeta? Meta { get; set; }
}

public class RemoteLockMeta
{
    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("per_page")]
    public int PerPage { get; set; }

    [JsonPropertyName("total_count")]
    public int TotalCount { get; set; }
}

public class RemoteLockDevice
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public RemoteLockDeviceAttributes? Attributes { get; set; }
}

public class RemoteLockDeviceAttributes
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("manufacturer")]
    public string? Manufacturer { get; set; }

    [JsonPropertyName("serial_number")]
    public string? SerialNumber { get; set; }

    [JsonPropertyName("lock_status")]
    public string? LockStatus { get; set; } // "locked", "unlocked"

    [JsonPropertyName("connectivity_status")]
    public string? ConnectivityStatus { get; set; } // "online", "offline"

    [JsonPropertyName("battery_level")]
    public int? BatteryLevel { get; set; }

    [JsonPropertyName("firmware_version")]
    public string? FirmwareVersion { get; set; }

    [JsonPropertyName("location_id")]
    public string? LocationId { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}

public class RemoteLockAccessCode
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public RemoteLockAccessCodeAttributes? Attributes { get; set; }
}

public class RemoteLockAccessCodeAttributes
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("pin")]
    public string? Pin { get; set; }

    [JsonPropertyName("starts_at")]
    public DateTime? StartsAt { get; set; }

    [JsonPropertyName("ends_at")]
    public DateTime? EndsAt { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}

public class RemoteLockLockStatus
{
    public string DeviceId { get; set; } = string.Empty;
    public bool IsLocked { get; set; }
    public int? BatteryLevel { get; set; }
    public bool IsOnline { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class CreateAccessCodeRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Pin { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
}
