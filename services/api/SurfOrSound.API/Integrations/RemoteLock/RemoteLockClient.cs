using System.Net.Http.Json;
using Microsoft.Extensions.Options;

namespace SurfOrSound.API.Integrations.RemoteLock;

public interface IRemoteLockClient
{
    Task<List<RemoteLockDevice>> GetDevicesAsync();
    Task<RemoteLockDevice?> GetDeviceAsync(string deviceId);
    Task<RemoteLockAccessCode> CreateAccessCodeAsync(string deviceId, CreateAccessCodeRequest request);
    Task DeleteAccessCodeAsync(string deviceId, string accessCodeId);
    Task<RemoteLockLockStatus> GetLockStatusAsync(string deviceId);
    Task<bool> LockAsync(string deviceId);
    Task<bool> UnlockAsync(string deviceId);
    Task<List<RemoteLockAccessCode>> GetAccessCodesAsync(string deviceId);
}

public class RemoteLockClient : IRemoteLockClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<RemoteLockClient> _logger;
    private readonly RemoteLockSettings _settings;

    public RemoteLockClient(
        HttpClient httpClient,
        ILogger<RemoteLockClient> logger,
        IOptions<RemoteLockSettings> settings)
    {
        _httpClient = httpClient;
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task<List<RemoteLockDevice>> GetDevicesAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/devices");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<RemoteLockListResponse<RemoteLockDevice>>();
            return result?.Data ?? new List<RemoteLockDevice>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get devices from RemoteLock");
            throw;
        }
    }

    public async Task<RemoteLockDevice?> GetDeviceAsync(string deviceId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/devices/{deviceId}");
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<RemoteLockResponse<RemoteLockDevice>>();
            return result?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get device {DeviceId} from RemoteLock", deviceId);
            throw;
        }
    }

    public async Task<RemoteLockAccessCode> CreateAccessCodeAsync(string deviceId, CreateAccessCodeRequest request)
    {
        try
        {
            var payload = new
            {
                type = "access_person",
                attributes = new
                {
                    name = request.Name,
                    pin = request.Pin,
                    starts_at = request.StartsAt?.ToString("o"),
                    ends_at = request.EndsAt?.ToString("o")
                }
            };

            var response = await _httpClient.PostAsJsonAsync($"/devices/{deviceId}/access_persons", new { data = payload });
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<RemoteLockResponse<RemoteLockAccessCode>>();
            return result?.Data ?? throw new Exception("Failed to create access code");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create access code for device {DeviceId}", deviceId);
            throw;
        }
    }

    public async Task DeleteAccessCodeAsync(string deviceId, string accessCodeId)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"/devices/{deviceId}/access_persons/{accessCodeId}");
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete access code {AccessCodeId} for device {DeviceId}",
                accessCodeId, deviceId);
            throw;
        }
    }

    public async Task<RemoteLockLockStatus> GetLockStatusAsync(string deviceId)
    {
        try
        {
            var device = await GetDeviceAsync(deviceId);
            return new RemoteLockLockStatus
            {
                DeviceId = deviceId,
                IsLocked = device?.Attributes?.LockStatus == "locked",
                BatteryLevel = device?.Attributes?.BatteryLevel,
                IsOnline = device?.Attributes?.ConnectivityStatus == "online",
                LastUpdated = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get lock status for device {DeviceId}", deviceId);
            throw;
        }
    }

    public async Task<bool> LockAsync(string deviceId)
    {
        try
        {
            var response = await _httpClient.PostAsync($"/devices/{deviceId}/lock", null);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to lock device {DeviceId}", deviceId);
            return false;
        }
    }

    public async Task<bool> UnlockAsync(string deviceId)
    {
        try
        {
            var response = await _httpClient.PostAsync($"/devices/{deviceId}/unlock", null);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to unlock device {DeviceId}", deviceId);
            return false;
        }
    }

    public async Task<List<RemoteLockAccessCode>> GetAccessCodesAsync(string deviceId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/devices/{deviceId}/access_persons");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<RemoteLockListResponse<RemoteLockAccessCode>>();
            return result?.Data ?? new List<RemoteLockAccessCode>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get access codes for device {DeviceId}", deviceId);
            throw;
        }
    }
}
