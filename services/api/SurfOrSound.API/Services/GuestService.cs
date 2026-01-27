using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Models.DTOs;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Services;

public interface IGuestService
{
    Task<List<PropertyDto>> GetFavoritesAsync(Guid userId);
    Task AddFavoriteAsync(Guid userId, string propertyId);
    Task RemoveFavoriteAsync(Guid userId, string propertyId);
    Task<bool> IsFavoriteAsync(Guid userId, string propertyId);
}

public class GuestService : IGuestService
{
    private readonly AppDbContext _db;
    private readonly IPropertyService _propertyService;
    private readonly ILogger<GuestService> _logger;

    public GuestService(AppDbContext db, IPropertyService propertyService, ILogger<GuestService> logger)
    {
        _db = db;
        _propertyService = propertyService;
        _logger = logger;
    }

    public async Task<List<PropertyDto>> GetFavoritesAsync(Guid userId)
    {
        var favoriteIds = await _db.GuestFavorites
            .Where(f => f.GuestId == userId)
            .Select(f => f.PropertyTrackId)
            .ToListAsync();

        if (!favoriteIds.Any())
            return new List<PropertyDto>();

        // Get all properties and filter by favorites
        var result = await _propertyService.GetPropertiesAsync(new PropertyQueryParams { PageSize = 1000 }, userId);
        return result.Items.Where(p => favoriteIds.Contains(p.TrackId)).ToList();
    }

    public async Task AddFavoriteAsync(Guid userId, string propertyId)
    {
        var exists = await _db.GuestFavorites
            .AnyAsync(f => f.GuestId == userId && f.PropertyTrackId == propertyId);

        if (exists) return;

        _db.GuestFavorites.Add(new GuestFavorite
        {
            GuestId = userId,
            PropertyTrackId = propertyId
        });

        await _db.SaveChangesAsync();
    }

    public async Task RemoveFavoriteAsync(Guid userId, string propertyId)
    {
        var favorite = await _db.GuestFavorites
            .FirstOrDefaultAsync(f => f.GuestId == userId && f.PropertyTrackId == propertyId);

        if (favorite != null)
        {
            _db.GuestFavorites.Remove(favorite);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<bool> IsFavoriteAsync(Guid userId, string propertyId)
    {
        return await _db.GuestFavorites
            .AnyAsync(f => f.GuestId == userId && f.PropertyTrackId == propertyId);
    }
}
