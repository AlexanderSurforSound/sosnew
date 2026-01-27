using Microsoft.Extensions.Caching.Memory;
using SurfOrSound.API.Integrations.Track;
using SurfOrSound.API.Integrations.Sanity;
using SurfOrSound.API.Models.DTOs;

namespace SurfOrSound.API.Services;

public interface IPropertyService
{
    Task<PagedResult<PropertyDto>> GetPropertiesAsync(PropertyQueryParams query, Guid? userId = null);
    Task<PropertyDetailDto?> GetPropertyBySlugAsync(string slug, Guid? userId = null);
    Task<AvailabilityDto> GetAvailabilityAsync(string slug, DateTime start, DateTime end);
    Task<PricingDto> GetPricingAsync(string slug, DateTime start, DateTime end, int guests);
    Task<List<PropertyDto>> GetFeaturedPropertiesAsync(int limit = 6);
    Task<List<PropertyDto>> SearchPropertiesAsync(string query, int limit = 20);
}

public class PropertyService : IPropertyService
{
    private readonly ITrackClient _trackClient;
    private readonly ISanityClient _sanityClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<PropertyService> _logger;

    private static readonly TimeSpan PropertyCacheDuration = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan AvailabilityCacheDuration = TimeSpan.FromMinutes(1);

    public PropertyService(
        ITrackClient trackClient,
        ISanityClient sanityClient,
        IMemoryCache cache,
        ILogger<PropertyService> logger)
    {
        _trackClient = trackClient;
        _sanityClient = sanityClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<PagedResult<PropertyDto>> GetPropertiesAsync(PropertyQueryParams query, Guid? userId = null)
    {
        // Get base property data from Track
        var trackProperties = await GetCachedTrackPropertiesAsync();

        // Get enriched content from Sanity
        var sanityContent = await GetCachedSanityContentAsync();

        // Merge data
        var properties = trackProperties
            .Where(p => p.IsActive)
            .Select(tp => MergePropertyData(tp, sanityContent.GetValueOrDefault(tp.Id)))
            .ToList();

        // Apply filters
        if (!string.IsNullOrEmpty(query.Village))
            properties = properties.Where(p => p.Village?.Slug == query.Village).ToList();

        if (query.MinBedrooms.HasValue)
            properties = properties.Where(p => p.Bedrooms >= query.MinBedrooms).ToList();

        if (query.MaxBedrooms.HasValue)
            properties = properties.Where(p => p.Bedrooms <= query.MaxBedrooms).ToList();

        if (query.Amenities?.Any() == true)
            properties = properties.Where(p =>
                query.Amenities.All(a => p.Amenities.Any(pa => pa.Slug == a))).ToList();

        if (query.PetFriendly == true)
            properties = properties.Where(p => p.PetFriendly).ToList();

        // Apply date availability filter if dates provided
        if (!string.IsNullOrEmpty(query.CheckIn) && !string.IsNullOrEmpty(query.CheckOut))
        {
            var checkIn = DateTime.Parse(query.CheckIn);
            var checkOut = DateTime.Parse(query.CheckOut);
            var availableIds = await GetAvailablePropertyIdsAsync(
                properties.Select(p => p.TrackId).ToList(),
                checkIn,
                checkOut
            );
            properties = properties.Where(p => availableIds.Contains(p.TrackId)).ToList();
        }

        // Sort
        properties = query.SortBy switch
        {
            "price_asc" => properties.OrderBy(p => p.BaseRate ?? decimal.MaxValue).ToList(),
            "price_desc" => properties.OrderByDescending(p => p.BaseRate ?? 0).ToList(),
            "bedrooms_asc" => properties.OrderBy(p => p.Bedrooms).ToList(),
            "bedrooms_desc" => properties.OrderByDescending(p => p.Bedrooms).ToList(),
            _ => properties.OrderBy(p => p.Name).ToList()
        };

        // Paginate
        var total = properties.Count;
        var items = properties
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToList();

        return new PagedResult<PropertyDto>
        {
            Items = items,
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalPages = (int)Math.Ceiling(total / (double)query.PageSize)
        };
    }

    public async Task<PropertyDetailDto?> GetPropertyBySlugAsync(string slug, Guid? userId = null)
    {
        var trackProperties = await GetCachedTrackPropertiesAsync();
        var sanityContent = await GetCachedSanityContentAsync();

        // Find property by slug (stored in Sanity)
        var sanity = sanityContent.Values.FirstOrDefault(s => s.Slug == slug);
        if (sanity == null) return null;

        var track = trackProperties.FirstOrDefault(p => p.Id == sanity.TrackId);
        if (track == null) return null;

        return MergePropertyDetailData(track, sanity);
    }

    public async Task<AvailabilityDto> GetAvailabilityAsync(string slug, DateTime start, DateTime end)
    {
        var property = await GetPropertyBySlugAsync(slug);
        if (property == null)
            throw new ArgumentException("Property not found");

        var availability = await _trackClient.GetAvailabilityAsync(property.TrackId, start, end);

        return new AvailabilityDto
        {
            PropertyId = property.Id,
            Dates = availability.Dates.Select(d => new AvailabilityDateDto(
                d.Date,
                d.IsAvailable,
                d.Rate,
                d.MinimumStay
            )).ToList()
        };
    }

    public async Task<PricingDto> GetPricingAsync(string slug, DateTime start, DateTime end, int guests)
    {
        var property = await GetPropertyBySlugAsync(slug);
        if (property == null)
            throw new ArgumentException("Property not found");

        var rates = await _trackClient.GetRatesAsync(property.TrackId, start, end, guests);

        return new PricingDto
        {
            Nights = rates.Nights,
            BaseRate = rates.BaseRate,
            AccommodationTotal = rates.TotalRate,
            CleaningFee = rates.Fees.FirstOrDefault(f => f.Name.Contains("Clean", StringComparison.OrdinalIgnoreCase))?.Amount ?? 250,
            ServiceFee = rates.Fees.FirstOrDefault(f => f.Name.Contains("Service", StringComparison.OrdinalIgnoreCase))?.Amount ?? Math.Round(rates.TotalRate * 0.1m, 2),
            Taxes = rates.Taxes.Sum(t => t.Amount),
            Total = rates.GrandTotal,
            Deposit = Math.Round(rates.GrandTotal * 0.5m, 2)
        };
    }

    public async Task<List<PropertyDto>> GetFeaturedPropertiesAsync(int limit = 6)
    {
        var trackProperties = await GetCachedTrackPropertiesAsync();
        var sanityContent = await GetCachedSanityContentAsync();

        var featured = sanityContent.Values
            .Where(s => s.Featured)
            .Take(limit)
            .Select(s =>
            {
                var track = trackProperties.FirstOrDefault(p => p.Id == s.TrackId);
                return track != null ? MergePropertyData(track, s) : null;
            })
            .Where(p => p != null)
            .Cast<PropertyDto>()
            .ToList();

        return featured;
    }

    public async Task<List<PropertyDto>> SearchPropertiesAsync(string query, int limit = 20)
    {
        var trackProperties = await GetCachedTrackPropertiesAsync();
        var sanityContent = await GetCachedSanityContentAsync();

        var searchLower = query.ToLowerInvariant();

        var results = trackProperties
            .Where(p => p.IsActive)
            .Select(tp => new
            {
                Track = tp,
                Sanity = sanityContent.GetValueOrDefault(tp.Id)
            })
            .Where(x =>
                (x.Sanity?.Name?.Contains(searchLower, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (x.Track.Name?.Contains(searchLower, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (x.Sanity?.Village?.Name?.Contains(searchLower, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (x.Track.Village?.Contains(searchLower, StringComparison.OrdinalIgnoreCase) ?? false))
            .Take(limit)
            .Select(x => MergePropertyData(x.Track, x.Sanity))
            .ToList();

        return results;
    }

    private async Task<List<TrackProperty>> GetCachedTrackPropertiesAsync()
    {
        return await _cache.GetOrCreateAsync("track_properties", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = PropertyCacheDuration;
            return await _trackClient.GetPropertiesAsync();
        }) ?? new List<TrackProperty>();
    }

    private async Task<Dictionary<string, SanityPropertyContent>> GetCachedSanityContentAsync()
    {
        return await _cache.GetOrCreateAsync("sanity_properties", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = PropertyCacheDuration;
            return await _sanityClient.GetPropertyContentAsync();
        }) ?? new Dictionary<string, SanityPropertyContent>();
    }

    private async Task<HashSet<string>> GetAvailablePropertyIdsAsync(List<string> propertyIds, DateTime checkIn, DateTime checkOut)
    {
        var tasks = propertyIds.Select(async id =>
        {
            try
            {
                var availability = await _trackClient.GetAvailabilityAsync(id, checkIn, checkOut);
                var isAvailable = availability.Dates.All(d => d.IsAvailable);
                return isAvailable ? id : null;
            }
            catch
            {
                return null;
            }
        });

        var results = await Task.WhenAll(tasks);
        return results.Where(id => id != null).Cast<string>().ToHashSet();
    }

    private static PropertyDto MergePropertyData(TrackProperty track, SanityPropertyContent? sanity)
    {
        return new PropertyDto
        {
            Id = track.Id,
            TrackId = track.Id,
            Name = sanity?.Name ?? track.Name,
            Slug = sanity?.Slug ?? GenerateSlug(track.Name),
            Headline = sanity?.Headline,
            Description = sanity?.Description ?? track.Description,
            Village = sanity?.Village != null
                ? new VillageDto(sanity.Village.Id, sanity.Village.Name, sanity.Village.Slug, null)
                : null,
            Bedrooms = track.Bedrooms,
            Bathrooms = track.Bathrooms,
            Sleeps = track.Sleeps,
            PropertyType = track.PropertyType,
            Images = sanity?.Images?.Select(i => new PropertyImageDto(i.Url, i.Alt, i.Caption, i.IsPrimary)).ToList()
                ?? new List<PropertyImageDto>(),
            Amenities = sanity?.Amenities?.Select(a => new AmenityDto(a.Id, a.Name, a.Slug, a.Category, a.Icon)).ToList()
                ?? track.Amenities.Select(a => new AmenityDto(a, a, GenerateSlug(a), null, null)).ToList(),
            PetFriendly = track.Amenities.Any(a => a.Contains("pet", StringComparison.OrdinalIgnoreCase)),
            Featured = sanity?.Featured ?? false,
            BaseRate = track.BaseRate
        };
    }

    private static PropertyDetailDto MergePropertyDetailData(TrackProperty track, SanityPropertyContent sanity)
    {
        var baseDto = MergePropertyData(track, sanity);

        return new PropertyDetailDto
        {
            Id = baseDto.Id,
            TrackId = baseDto.TrackId,
            Name = baseDto.Name,
            Slug = baseDto.Slug,
            Headline = baseDto.Headline,
            Description = baseDto.Description,
            Village = baseDto.Village,
            Bedrooms = baseDto.Bedrooms,
            Bathrooms = baseDto.Bathrooms,
            Sleeps = baseDto.Sleeps,
            PropertyType = baseDto.PropertyType,
            Images = baseDto.Images,
            Amenities = baseDto.Amenities,
            PetFriendly = baseDto.PetFriendly,
            Featured = baseDto.Featured,
            BaseRate = baseDto.BaseRate,
            Highlights = sanity.Highlights,
            VirtualTourUrl = sanity.VirtualTourUrl,
            VideoUrl = sanity.VideoUrl,
            HouseRules = sanity.HouseRules,
            CheckInInstructions = sanity.CheckInInstructions,
            ParkingInstructions = sanity.ParkingInstructions,
            WifiName = sanity.WifiName,
            WifiPassword = sanity.WifiPassword,
            LocalTips = sanity.LocalTips,
            Address = track.Address != null
                ? new AddressDto(track.Address.Street, track.Address.City, track.Address.State, track.Address.Zip, track.Address.Lat, track.Address.Lng)
                : null,
            Seo = sanity.Seo != null
                ? new SeoDto(sanity.Seo.Title, sanity.Seo.Description)
                : null
        };
    }

    private static string GenerateSlug(string name)
    {
        return name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "")
            .Replace(",", "")
            .Replace(".", "");
    }
}
