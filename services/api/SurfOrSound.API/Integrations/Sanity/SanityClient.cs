using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace SurfOrSound.API.Integrations.Sanity;

public interface ISanityClient
{
    Task<Dictionary<string, SanityPropertyContent>> GetPropertyContentAsync();
    Task<SanityPropertyContent?> GetPropertyContentByTrackIdAsync(string trackId);
    Task<List<SanityVillage>> GetVillagesAsync();
    Task<SanityVillage?> GetVillageBySlugAsync(string slug);
    Task<List<SanityAmenity>> GetAmenitiesAsync();
}

public class SanityClient : ISanityClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SanityClient> _logger;
    private readonly SanitySettings _settings;

    public SanityClient(HttpClient httpClient, ILogger<SanityClient> logger, IOptions<SanitySettings> settings)
    {
        _httpClient = httpClient;
        _logger = logger;
        _settings = settings.Value;

        _httpClient.BaseAddress = new Uri($"https://{_settings.ProjectId}.api.sanity.io/v{_settings.ApiVersion}/data/query/{_settings.Dataset}");
        if (!string.IsNullOrEmpty(_settings.Token))
        {
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_settings.Token}");
        }
    }

    private string BuildQueryUrl(string query)
    {
        return $"?query={Uri.EscapeDataString(query)}";
    }

    public async Task<Dictionary<string, SanityPropertyContent>> GetPropertyContentAsync()
    {
        try
        {
            var query = @"*[_type == 'property'] {
                trackId,
                name,
                'slug': slug.current,
                headline,
                description,
                highlights,
                'village': village-> {
                    'id': _id,
                    name,
                    'slug': slug.current
                },
                'images': images[] {
                    'url': asset->url,
                    alt,
                    caption,
                    isPrimary
                },
                'amenities': amenities[]-> {
                    'id': _id,
                    name,
                    'slug': slug.current,
                    category,
                    icon
                },
                virtualTourUrl,
                videoUrl,
                houseRules,
                checkInInstructions,
                parkingInstructions,
                wifiName,
                wifiPassword,
                localTips,
                featured,
                seo
            }";

            var response = await _httpClient.GetAsync(BuildQueryUrl(query));
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<SanityQueryResult<List<SanityPropertyContent>>>();

            return result?.Result?.ToDictionary(p => p.TrackId, p => p) ?? new Dictionary<string, SanityPropertyContent>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get property content from Sanity");
            throw;
        }
    }

    public async Task<SanityPropertyContent?> GetPropertyContentByTrackIdAsync(string trackId)
    {
        try
        {
            var query = $@"*[_type == 'property' && trackId == '{trackId}'][0] {{
                trackId,
                name,
                'slug': slug.current,
                headline,
                description,
                highlights,
                'village': village-> {{
                    'id': _id,
                    name,
                    'slug': slug.current
                }},
                'images': images[] {{
                    'url': asset->url,
                    alt,
                    caption,
                    isPrimary
                }},
                'amenities': amenities[]-> {{
                    'id': _id,
                    name,
                    'slug': slug.current,
                    category,
                    icon
                }},
                virtualTourUrl,
                videoUrl,
                houseRules,
                checkInInstructions,
                parkingInstructions,
                wifiName,
                wifiPassword,
                localTips,
                featured,
                seo
            }}";

            var response = await _httpClient.GetAsync(BuildQueryUrl(query));
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<SanityQueryResult<SanityPropertyContent>>();
            return result?.Result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get property content for {TrackId} from Sanity", trackId);
            throw;
        }
    }

    public async Task<List<SanityVillage>> GetVillagesAsync()
    {
        try
        {
            var query = @"*[_type == 'village'] | order(order asc) {
                'id': _id,
                name,
                'slug': slug.current,
                description,
                shortDescription,
                'heroImage': heroImage.asset->url,
                highlights,
                location,
                order
            }";

            var response = await _httpClient.GetAsync(BuildQueryUrl(query));
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<SanityQueryResult<List<SanityVillage>>>();
            return result?.Result ?? new List<SanityVillage>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get villages from Sanity");
            throw;
        }
    }

    public async Task<SanityVillage?> GetVillageBySlugAsync(string slug)
    {
        try
        {
            var query = $@"*[_type == 'village' && slug.current == '{slug}'][0] {{
                'id': _id,
                name,
                'slug': slug.current,
                description,
                shortDescription,
                'heroImage': heroImage.asset->url,
                highlights,
                location,
                order
            }}";

            var response = await _httpClient.GetAsync(BuildQueryUrl(query));
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<SanityQueryResult<SanityVillage>>();
            return result?.Result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get village {Slug} from Sanity", slug);
            throw;
        }
    }

    public async Task<List<SanityAmenity>> GetAmenitiesAsync()
    {
        try
        {
            var query = @"*[_type == 'amenity'] | order(name asc) {
                'id': _id,
                name,
                'slug': slug.current,
                category,
                icon,
                description,
                isFilterable
            }";

            var response = await _httpClient.GetAsync(BuildQueryUrl(query));
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<SanityQueryResult<List<SanityAmenity>>>();
            return result?.Result ?? new List<SanityAmenity>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get amenities from Sanity");
            throw;
        }
    }
}

public record SanityQueryResult<T>(T? Result);

public record SanityPropertyContent
{
    public string TrackId { get; init; } = "";
    public string? Name { get; init; }
    public string? Slug { get; init; }
    public string? Headline { get; init; }
    public string? Description { get; init; }
    public List<string>? Highlights { get; init; }
    public SanityVillageRef? Village { get; init; }
    public List<SanityImage>? Images { get; init; }
    public List<SanityAmenityRef>? Amenities { get; init; }
    public string? VirtualTourUrl { get; init; }
    public string? VideoUrl { get; init; }
    public string? HouseRules { get; init; }
    public string? CheckInInstructions { get; init; }
    public string? ParkingInstructions { get; init; }
    public string? WifiName { get; init; }
    public string? WifiPassword { get; init; }
    public string? LocalTips { get; init; }
    public bool Featured { get; init; }
    public SanitySeo? Seo { get; init; }
}

public record SanityVillageRef(string Id, string Name, string Slug);
public record SanityAmenityRef(string Id, string Name, string Slug, string? Category, string? Icon);
public record SanityImage(string Url, string? Alt, string? Caption, bool IsPrimary);
public record SanitySeo(string? Title, string? Description);

public record SanityVillage
{
    public string Id { get; init; } = "";
    public string Name { get; init; } = "";
    public string Slug { get; init; } = "";
    public string? Description { get; init; }
    public string? ShortDescription { get; init; }
    public string? HeroImage { get; init; }
    public List<string>? Highlights { get; init; }
    public SanityGeoPoint? Location { get; init; }
    public int? Order { get; init; }
}

public record SanityGeoPoint(decimal Lat, decimal Lng);

public record SanityAmenity
{
    public string Id { get; init; } = "";
    public string Name { get; init; } = "";
    public string Slug { get; init; } = "";
    public string? Category { get; init; }
    public string? Icon { get; init; }
    public string? Description { get; init; }
    public bool IsFilterable { get; init; }
}
