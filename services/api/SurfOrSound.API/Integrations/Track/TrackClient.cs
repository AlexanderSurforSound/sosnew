using System.Net.Http.Json;
using Microsoft.Extensions.Options;

namespace SurfOrSound.API.Integrations.Track;

public interface ITrackClient
{
    Task<List<TrackProperty>> GetPropertiesAsync();
    Task<TrackProperty?> GetPropertyAsync(string propertyId);
    Task<TrackAvailability> GetAvailabilityAsync(string propertyId, DateTime start, DateTime end);
    Task<TrackRateInfo> GetRatesAsync(string propertyId, DateTime start, DateTime end, int guests);
    Task<TrackReservation> CreateReservationAsync(CreateTrackReservationRequest request);
    Task<TrackReservation?> GetReservationAsync(string reservationId);
    Task<List<TrackReservation>> GetReservationsAsync(string? guestId = null, string? propertyId = null, DateTime? fromDate = null);
    Task<TrackGuest?> GetGuestAsync(string guestId);
    Task<TrackGuest> CreateGuestAsync(CreateTrackGuestRequest request);
    Task<TrackGuest?> FindGuestByEmailAsync(string email);
}

public class TrackClient : ITrackClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TrackClient> _logger;
    private readonly TrackSettings _settings;

    public TrackClient(HttpClient httpClient, ILogger<TrackClient> logger, IOptions<TrackSettings> settings)
    {
        _httpClient = httpClient;
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task<List<TrackProperty>> GetPropertiesAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/properties");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<List<TrackProperty>>>();
            return result?.Data ?? new List<TrackProperty>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get properties from Track");
            throw;
        }
    }

    public async Task<TrackProperty?> GetPropertyAsync(string propertyId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/properties/{propertyId}");
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<TrackProperty>>();
            return result?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get property {PropertyId} from Track", propertyId);
            throw;
        }
    }

    public async Task<TrackAvailability> GetAvailabilityAsync(string propertyId, DateTime start, DateTime end)
    {
        try
        {
            var url = $"/properties/{propertyId}/availability?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<TrackAvailability>>();
            return result?.Data ?? new TrackAvailability(propertyId, new List<TrackAvailabilityDate>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get availability for property {PropertyId}", propertyId);
            throw;
        }
    }

    public async Task<TrackRateInfo> GetRatesAsync(string propertyId, DateTime start, DateTime end, int guests)
    {
        try
        {
            var url = $"/properties/{propertyId}/rates?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&guests={guests}";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<TrackRateInfo>>();
            return result?.Data ?? throw new Exception("Failed to get rates");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get rates for property {PropertyId}", propertyId);
            throw;
        }
    }

    public async Task<TrackReservation> CreateReservationAsync(CreateTrackReservationRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/reservations", request);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<TrackReservation>>();
            return result?.Data ?? throw new Exception("Failed to create reservation");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create reservation in Track");
            throw;
        }
    }

    public async Task<TrackReservation?> GetReservationAsync(string reservationId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/reservations/{reservationId}");
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<TrackReservation>>();
            return result?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get reservation {ReservationId} from Track", reservationId);
            throw;
        }
    }

    public async Task<List<TrackReservation>> GetReservationsAsync(string? guestId = null, string? propertyId = null, DateTime? fromDate = null)
    {
        try
        {
            var query = new List<string>();
            if (guestId != null) query.Add($"guestId={guestId}");
            if (propertyId != null) query.Add($"propertyId={propertyId}");
            if (fromDate != null) query.Add($"from={fromDate:yyyy-MM-dd}");

            var url = "/reservations" + (query.Count > 0 ? "?" + string.Join("&", query) : "");
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<List<TrackReservation>>>();
            return result?.Data ?? new List<TrackReservation>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get reservations from Track");
            throw;
        }
    }

    public async Task<TrackGuest?> GetGuestAsync(string guestId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/guests/{guestId}");
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<TrackGuest>>();
            return result?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get guest {GuestId} from Track", guestId);
            throw;
        }
    }

    public async Task<TrackGuest> CreateGuestAsync(CreateTrackGuestRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/guests", request);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<TrackGuest>>();
            return result?.Data ?? throw new Exception("Failed to create guest");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create guest in Track");
            throw;
        }
    }

    public async Task<TrackGuest?> FindGuestByEmailAsync(string email)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/guests?email={Uri.EscapeDataString(email)}");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TrackApiResponse<List<TrackGuest>>>();
            return result?.Data?.FirstOrDefault();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to find guest by email in Track");
            throw;
        }
    }
}
