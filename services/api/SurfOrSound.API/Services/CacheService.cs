using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace SurfOrSound.API.Services;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default);
    Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
}

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<RedisCacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    private static class CacheKeys
    {
        public const string Properties = "properties";
        public const string Property = "property:";
        public const string Availability = "availability:";
        public const string Rates = "rates:";
        public const string Guest = "guest:";
        public const string Villages = "villages";
        public const string Amenities = "amenities";
        public const string Achievements = "achievements";
        public const string FeaturedProperties = "featured_properties";
    }

    public static class CacheDurations
    {
        public static readonly TimeSpan Short = TimeSpan.FromMinutes(1);
        public static readonly TimeSpan Medium = TimeSpan.FromMinutes(5);
        public static readonly TimeSpan Long = TimeSpan.FromMinutes(30);
        public static readonly TimeSpan VeryLong = TimeSpan.FromHours(1);
        public static readonly TimeSpan Day = TimeSpan.FromHours(24);
    }

    public RedisCacheService(IDistributedCache cache, ILogger<RedisCacheService> logger)
    {
        _cache = cache;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var data = await _cache.GetStringAsync(key, cancellationToken);
            if (string.IsNullOrEmpty(data))
                return default;

            return JsonSerializer.Deserialize<T>(data, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get cache key {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? CacheDurations.Medium
            };

            var data = JsonSerializer.Serialize(value, _jsonOptions);
            await _cache.SetStringAsync(key, data, options, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to set cache key {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _cache.RemoveAsync(key, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to remove cache key {Key}", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        // Note: This requires Redis server-side scripting or SCAN command
        // For now, we'll log and handle individual removals
        _logger.LogInformation("Cache invalidation requested for prefix {Prefix}", prefix);
        // In production, implement using Redis SCAN + DEL or Lua script
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached is not null)
            return cached;

        var value = await factory();
        await SetAsync(key, value, expiration, cancellationToken);
        return value;
    }
}

// Cache key builder helpers
public static class CacheKeyBuilder
{
    public static string Property(string trackId) => $"property:{trackId}";
    public static string Availability(string trackId, DateTime start, DateTime end)
        => $"availability:{trackId}:{start:yyyyMMdd}:{end:yyyyMMdd}";
    public static string Rates(string trackId, DateTime start, DateTime end, int guests)
        => $"rates:{trackId}:{start:yyyyMMdd}:{end:yyyyMMdd}:{guests}";
    public static string Guest(Guid guestId) => $"guest:{guestId}";
    public static string GuestByEmail(string email) => $"guest:email:{email.ToLowerInvariant()}";
    public static string GuestAchievements(Guid guestId) => $"achievements:guest:{guestId}";
    public static string PropertyReviews(string trackId) => $"reviews:property:{trackId}";
    public static string Conversation(Guid conversationId) => $"conversation:{conversationId}";
}
