namespace SurfOrSound.API.Models.DTOs;

public record PropertyDto
{
    public string Id { get; init; } = "";
    public string TrackId { get; init; } = "";
    public string Name { get; init; } = "";
    public string Slug { get; init; } = "";
    public string? Headline { get; init; }
    public string? Description { get; init; }
    public VillageDto? Village { get; init; }
    public int Bedrooms { get; init; }
    public decimal Bathrooms { get; init; }
    public int Sleeps { get; init; }
    public string PropertyType { get; init; } = "";
    public List<PropertyImageDto> Images { get; init; } = new();
    public List<AmenityDto> Amenities { get; init; } = new();
    public bool PetFriendly { get; init; }
    public bool Featured { get; init; }
    public decimal? BaseRate { get; init; }
    public bool IsFavorite { get; init; }
}

public record PropertyDetailDto : PropertyDto
{
    public List<string>? Highlights { get; init; }
    public string? VirtualTourUrl { get; init; }
    public string? VideoUrl { get; init; }
    public string? HouseRules { get; init; }
    public string? CheckInInstructions { get; init; }
    public string? ParkingInstructions { get; init; }
    public string? WifiName { get; init; }
    public string? WifiPassword { get; init; }
    public string? LocalTips { get; init; }
    public AddressDto? Address { get; init; }
    public SeoDto? Seo { get; init; }
}

public record PropertyImageDto(string Url, string? Alt, string? Caption, bool IsPrimary);
public record VillageDto(string Id, string Name, string Slug, string? ShortDescription);
public record AmenityDto(string Id, string Name, string Slug, string? Category, string? Icon);
public record AddressDto(string? Street, string? City, string? State, string? Zip, decimal? Lat, decimal? Lng);
public record SeoDto(string? Title, string? Description);

public record PropertyQueryParams
{
    public string? Village { get; init; }
    public int? MinBedrooms { get; init; }
    public int? MaxBedrooms { get; init; }
    public string? CheckIn { get; init; }
    public string? CheckOut { get; init; }
    public int? Guests { get; init; }
    public List<string>? Amenities { get; init; }
    public bool? PetFriendly { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 24;
    public string? SortBy { get; init; }
}

public record AvailabilityDto
{
    public string PropertyId { get; init; } = "";
    public List<AvailabilityDateDto> Dates { get; init; } = new();
}

public record AvailabilityDateDto(DateTime Date, bool IsAvailable, decimal? Rate, int MinimumStay);

public record PricingDto
{
    public int Nights { get; init; }
    public decimal BaseRate { get; init; }
    public decimal AccommodationTotal { get; init; }
    public decimal CleaningFee { get; init; }
    public decimal ServiceFee { get; init; }
    public decimal Taxes { get; init; }
    public decimal Total { get; init; }
    public decimal Deposit { get; init; }
}
