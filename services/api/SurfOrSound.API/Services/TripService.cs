using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Integrations.Track;
using SurfOrSound.API.Models.DTOs;

namespace SurfOrSound.API.Services;

public interface ITripService
{
    Task<TripDashboardDto?> GetTripDashboardAsync(string reservationId, Guid userId, CancellationToken ct = default);
    Task<List<TripSummaryDto>> GetUpcomingTripsAsync(Guid userId, CancellationToken ct = default);
}

public class TripService : ITripService
{
    private readonly ITrackClient _trackClient;
    private readonly IPropertyService _propertyService;
    private readonly IAIService _aiService;
    private readonly AppDbContext _db;
    private readonly ILogger<TripService> _logger;

    public TripService(
        ITrackClient trackClient,
        IPropertyService propertyService,
        IAIService aiService,
        AppDbContext db,
        ILogger<TripService> logger)
    {
        _trackClient = trackClient;
        _propertyService = propertyService;
        _aiService = aiService;
        _db = db;
        _logger = logger;
    }

    public async Task<TripDashboardDto?> GetTripDashboardAsync(string reservationId, Guid userId, CancellationToken ct = default)
    {
        var guest = await _db.Guests.FindAsync(new object[] { userId }, ct);
        if (guest == null)
            return null;

        var reservation = await _trackClient.GetReservationAsync(reservationId);
        if (reservation == null || guest.TrackGuestId != reservation.GuestId)
            return null;

        // Get property details
        var property = await _propertyService.GetPropertyBySlugAsync(reservation.PropertyId, userId);
        if (property == null)
            return null;

        var checkIn = reservation.CheckIn;
        var checkOut = reservation.CheckOut;
        var today = DateTime.UtcNow.Date;
        var daysUntilTrip = (checkIn.Date - today).Days;
        var tripDuration = (checkOut.Date - checkIn.Date).Days;

        // Determine trip phase
        var phase = daysUntilTrip switch
        {
            > 30 => TripPhase.Planning,
            > 7 => TripPhase.Preparing,
            > 0 => TripPhase.Countdown,
            0 => TripPhase.CheckInDay,
            _ when today < checkOut.Date => TripPhase.OnTrip,
            _ => TripPhase.Completed
        };

        // Build countdown milestones
        var milestones = BuildMilestones(checkIn, checkOut, today);

        // Get weather forecast (mock for now - would integrate with weather API)
        var weather = GetWeatherForecast(checkIn, Math.Min(tripDuration, 7));

        // Get activity suggestions based on property and season
        var activities = GetActivitySuggestions(property, checkIn);

        // Get packing suggestions
        var packingList = GetPackingList(property, checkIn, (reservation.Pets ?? 0) > 0);

        // Build check-in info
        var checkInInfo = new CheckInInfoDto
        {
            Date = checkIn.ToString("yyyy-MM-dd"),
            Time = "4:00 PM",
            Address = property.Address != null
                ? $"{property.Address.Street}, {property.Address.City}, NC {property.Address.Zip}"
                : $"{property.Village?.Name ?? "Hatteras Island"}, NC",
            Instructions = property.CheckInInstructions,
            WifiName = property.WifiName,
            WifiPassword = property.WifiPassword,
            ParkingInstructions = property.ParkingInstructions,
            DoorCode = null // Would come from smart home integration
        };

        return new TripDashboardDto
        {
            ReservationId = reservationId,
            Property = new PropertySummaryDto
            {
                Id = property.Id,
                Name = property.Name,
                Slug = property.Slug,
                Village = property.Village?.Name,
                Bedrooms = property.Bedrooms,
                Bathrooms = property.Bathrooms,
                Sleeps = property.Sleeps,
                PrimaryImage = property.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? property.Images.FirstOrDefault()?.Url,
                Address = checkInInfo.Address
            },
            Countdown = new CountdownDto
            {
                DaysUntilTrip = Math.Max(0, daysUntilTrip),
                TripDuration = tripDuration,
                CheckInDate = checkIn.ToString("yyyy-MM-dd"),
                CheckOutDate = checkOut.ToString("yyyy-MM-dd"),
                Phase = phase.ToString(),
                PhaseMessage = GetPhaseMessage(phase, daysUntilTrip, property.Name)
            },
            Milestones = milestones,
            Weather = weather,
            Activities = activities,
            PackingList = packingList,
            CheckInInfo = checkInInfo,
            Guests = new GuestCountDto
            {
                Adults = reservation.Adults,
                Children = reservation.Children,
                Pets = reservation.Pets ?? 0,
                Total = reservation.Adults + reservation.Children
            },
            Payment = new PaymentSummaryDto
            {
                TotalAmount = reservation.TotalAmount,
                AmountPaid = reservation.Payment?.AmountPaid ?? 0,
                AmountDue = reservation.Payment?.AmountDue ?? reservation.TotalAmount,
                Status = reservation.Payment?.Status ?? "pending",
                DueDate = checkIn.AddDays(-30).ToString("yyyy-MM-dd")
            }
        };
    }

    public async Task<List<TripSummaryDto>> GetUpcomingTripsAsync(Guid userId, CancellationToken ct = default)
    {
        var guest = await _db.Guests.FindAsync(new object[] { userId }, ct);
        if (guest == null || string.IsNullOrEmpty(guest.TrackGuestId))
            return new List<TripSummaryDto>();

        var reservations = await _trackClient.GetReservationsAsync(guestId: guest.TrackGuestId);

        var today = DateTime.UtcNow.Date;
        var upcomingTrips = new List<TripSummaryDto>();

        foreach (var r in reservations.Where(r => r.CheckOut.Date >= today).OrderBy(r => r.CheckIn))
        {
            var daysUntil = (r.CheckIn.Date - today).Days;
            var property = await _propertyService.GetPropertyBySlugAsync(r.PropertyId, userId);

            upcomingTrips.Add(new TripSummaryDto
            {
                ReservationId = r.Id,
                PropertyName = property?.Name ?? "Unknown Property",
                PropertySlug = property?.Slug ?? r.PropertyId,
                PropertyImage = property?.Images.FirstOrDefault()?.Url,
                Village = property?.Village?.Name,
                CheckIn = r.CheckIn.ToString("yyyy-MM-dd"),
                CheckOut = r.CheckOut.ToString("yyyy-MM-dd"),
                DaysUntil = Math.Max(0, daysUntil),
                Status = r.Status,
                IsCurrentTrip = daysUntil <= 0 && r.CheckOut.Date >= today
            });
        }

        return upcomingTrips;
    }

    private static List<MilestoneDto> BuildMilestones(DateTime checkIn, DateTime checkOut, DateTime today)
    {
        var milestones = new List<MilestoneDto>();
        var daysUntil = (checkIn.Date - today).Days;

        // 30 days out - Final payment reminder
        var thirtyDays = checkIn.AddDays(-30);
        milestones.Add(new MilestoneDto
        {
            Id = "payment",
            Title = "Final Payment Due",
            Date = thirtyDays.ToString("yyyy-MM-dd"),
            DaysFromNow = (thirtyDays.Date - today).Days,
            Icon = "credit-card",
            IsCompleted = today >= thirtyDays.Date,
            IsCurrent = today.Date == thirtyDays.Date
        });

        // 14 days out - Start packing
        var fourteenDays = checkIn.AddDays(-14);
        milestones.Add(new MilestoneDto
        {
            Id = "packing",
            Title = "Start Packing",
            Date = fourteenDays.ToString("yyyy-MM-dd"),
            DaysFromNow = (fourteenDays.Date - today).Days,
            Icon = "luggage",
            IsCompleted = today >= fourteenDays.Date,
            IsCurrent = today.Date == fourteenDays.Date
        });

        // 7 days out - Check weather
        var sevenDays = checkIn.AddDays(-7);
        milestones.Add(new MilestoneDto
        {
            Id = "weather",
            Title = "Check Weather Forecast",
            Date = sevenDays.ToString("yyyy-MM-dd"),
            DaysFromNow = (sevenDays.Date - today).Days,
            Icon = "cloud-sun",
            IsCompleted = today >= sevenDays.Date,
            IsCurrent = today.Date == sevenDays.Date
        });

        // 1 day out - Final prep
        var oneDay = checkIn.AddDays(-1);
        milestones.Add(new MilestoneDto
        {
            Id = "prep",
            Title = "Final Trip Prep",
            Date = oneDay.ToString("yyyy-MM-dd"),
            DaysFromNow = (oneDay.Date - today).Days,
            Icon = "clipboard-check",
            IsCompleted = today >= oneDay.Date,
            IsCurrent = today.Date == oneDay.Date
        });

        // Check-in day
        milestones.Add(new MilestoneDto
        {
            Id = "checkin",
            Title = "Check-In Day!",
            Date = checkIn.ToString("yyyy-MM-dd"),
            DaysFromNow = daysUntil,
            Icon = "key",
            IsCompleted = today > checkIn.Date,
            IsCurrent = today.Date == checkIn.Date
        });

        // Check-out
        milestones.Add(new MilestoneDto
        {
            Id = "checkout",
            Title = "Check-Out",
            Date = checkOut.ToString("yyyy-MM-dd"),
            DaysFromNow = (checkOut.Date - today).Days,
            Icon = "door-open",
            IsCompleted = today >= checkOut.Date,
            IsCurrent = today.Date == checkOut.Date
        });

        return milestones;
    }

    private static List<WeatherDayDto> GetWeatherForecast(DateTime startDate, int days)
    {
        // Mock weather data - would integrate with weather API in production
        var conditions = new[] { "Sunny", "Partly Cloudy", "Mostly Sunny", "Scattered Clouds", "Clear" };
        var icons = new[] { "sun", "cloud-sun", "sun", "cloud", "moon" };
        var random = new Random(startDate.DayOfYear);

        return Enumerable.Range(0, days).Select(i =>
        {
            var date = startDate.AddDays(i);
            var conditionIndex = random.Next(conditions.Length);
            var highTemp = 70 + random.Next(20); // Summer temps
            var lowTemp = highTemp - 10 - random.Next(5);

            return new WeatherDayDto
            {
                Date = date.ToString("yyyy-MM-dd"),
                DayOfWeek = date.ToString("ddd"),
                Condition = conditions[conditionIndex],
                Icon = icons[conditionIndex],
                HighTemp = highTemp,
                LowTemp = lowTemp,
                PrecipChance = random.Next(30),
                Humidity = 60 + random.Next(20),
                WindSpeed = 5 + random.Next(15),
                UvIndex = 6 + random.Next(4)
            };
        }).ToList();
    }

    private static List<ActivitySuggestionDto> GetActivitySuggestions(PropertyDetailDto property, DateTime checkIn)
    {
        var activities = new List<ActivitySuggestionDto>();
        var village = property.Village?.Name?.ToLowerInvariant() ?? "";

        // Always suggest beach activities
        activities.Add(new ActivitySuggestionDto
        {
            Id = "beach",
            Title = "Beach Day",
            Description = "Enjoy the pristine beaches of Hatteras Island. Don't forget sunscreen!",
            Category = "Outdoors",
            Icon = "umbrella-beach",
            Duration = "Full Day",
            Distance = "Walk from property"
        });

        // Village-specific activities
        if (village.Contains("buxton"))
        {
            activities.Add(new ActivitySuggestionDto
            {
                Id = "lighthouse",
                Title = "Cape Hatteras Lighthouse",
                Description = "Climb the tallest brick lighthouse in North America for stunning views.",
                Category = "Attraction",
                Icon = "landmark",
                Duration = "2-3 hours",
                Distance = "5 min drive"
            });

            activities.Add(new ActivitySuggestionDto
            {
                Id = "surfing",
                Title = "Surfing at the Point",
                Description = "Buxton is known for some of the best surfing on the East Coast.",
                Category = "Water Sports",
                Icon = "water",
                Duration = "Half Day",
                Distance = "10 min drive"
            });
        }

        if (village.Contains("hatteras"))
        {
            activities.Add(new ActivitySuggestionDto
            {
                Id = "ferry",
                Title = "Ocracoke Ferry",
                Description = "Take the free ferry to Ocracoke Island for a day trip adventure.",
                Category = "Adventure",
                Icon = "ship",
                Duration = "Full Day",
                Distance = "At Hatteras Village"
            });
        }

        if (village.Contains("avon"))
        {
            activities.Add(new ActivitySuggestionDto
            {
                Id = "pier",
                Title = "Avon Fishing Pier",
                Description = "Try your hand at pier fishing or just enjoy the ocean views.",
                Category = "Fishing",
                Icon = "fish",
                Duration = "2-4 hours",
                Distance = "5 min drive"
            });
        }

        if (village.Contains("rodanthe"))
        {
            activities.Add(new ActivitySuggestionDto
            {
                Id = "chicamacomico",
                Title = "Chicamacomico Life-Saving Station",
                Description = "Explore historic maritime rescue history at this preserved station.",
                Category = "History",
                Icon = "anchor",
                Duration = "1-2 hours",
                Distance = "In Rodanthe"
            });
        }

        // Universal activities
        activities.Add(new ActivitySuggestionDto
        {
            Id = "kayak",
            Title = "Kayaking on Pamlico Sound",
            Description = "Paddle through calm waters and explore the sound side of the island.",
            Category = "Water Sports",
            Icon = "sailboat",
            Duration = "2-3 hours",
            Distance = "Various locations"
        });

        activities.Add(new ActivitySuggestionDto
        {
            Id = "wildlife",
            Title = "Pea Island Wildlife Refuge",
            Description = "Bird watching and nature trails in this protected sanctuary.",
            Category = "Nature",
            Icon = "bird",
            Duration = "2-4 hours",
            Distance = "North end of island"
        });

        activities.Add(new ActivitySuggestionDto
        {
            Id = "sunset",
            Title = "Sound-Side Sunset",
            Description = "Watch spectacular sunsets over Pamlico Sound - a Hatteras tradition.",
            Category = "Relaxation",
            Icon = "sunset",
            Duration = "1 hour",
            Distance = "Any sound access"
        });

        return activities;
    }

    private static List<PackingCategoryDto> GetPackingList(PropertyDetailDto property, DateTime checkIn, bool hasPets)
    {
        var categories = new List<PackingCategoryDto>();

        // Beach Essentials
        categories.Add(new PackingCategoryDto
        {
            Category = "Beach Essentials",
            Icon = "umbrella-beach",
            Items = new List<PackingItemDto>
            {
                new() { Name = "Sunscreen (SPF 30+)", IsEssential = true },
                new() { Name = "Beach towels", IsEssential = true },
                new() { Name = "Beach chairs", IsEssential = false },
                new() { Name = "Umbrella or beach tent", IsEssential = false },
                new() { Name = "Cooler for drinks", IsEssential = false },
                new() { Name = "Sunglasses", IsEssential = true },
                new() { Name = "Beach toys/sand toys", IsEssential = false },
                new() { Name = "Boogie boards", IsEssential = false }
            }
        });

        // Clothing
        categories.Add(new PackingCategoryDto
        {
            Category = "Clothing",
            Icon = "shirt",
            Items = new List<PackingItemDto>
            {
                new() { Name = "Swimsuits (2-3 per person)", IsEssential = true },
                new() { Name = "Cover-ups/beach wraps", IsEssential = false },
                new() { Name = "Light layers for evenings", IsEssential = true },
                new() { Name = "Rain jacket (just in case)", IsEssential = false },
                new() { Name = "Comfortable walking shoes", IsEssential = true },
                new() { Name = "Flip flops/sandals", IsEssential = true },
                new() { Name = "Water shoes", IsEssential = false },
                new() { Name = "Hat for sun protection", IsEssential = true }
            }
        });

        // Health & Safety
        categories.Add(new PackingCategoryDto
        {
            Category = "Health & Safety",
            Icon = "first-aid",
            Items = new List<PackingItemDto>
            {
                new() { Name = "Medications & prescriptions", IsEssential = true },
                new() { Name = "First aid kit", IsEssential = true },
                new() { Name = "Insect repellent", IsEssential = true },
                new() { Name = "Aloe vera for sunburn", IsEssential = false },
                new() { Name = "Motion sickness remedies", IsEssential = false }
            }
        });

        // Electronics
        categories.Add(new PackingCategoryDto
        {
            Category = "Electronics",
            Icon = "smartphone",
            Items = new List<PackingItemDto>
            {
                new() { Name = "Phone chargers", IsEssential = true },
                new() { Name = "Camera", IsEssential = false },
                new() { Name = "Waterproof phone case", IsEssential = false },
                new() { Name = "Portable speaker", IsEssential = false },
                new() { Name = "E-reader/books", IsEssential = false }
            }
        });

        // Kitchen/Food (if applicable)
        categories.Add(new PackingCategoryDto
        {
            Category = "Kitchen & Food",
            Icon = "utensils",
            Items = new List<PackingItemDto>
            {
                new() { Name = "Coffee/tea (your favorite)", IsEssential = false },
                new() { Name = "Snacks for travel", IsEssential = false },
                new() { Name = "Reusable water bottles", IsEssential = true },
                new() { Name = "Special dietary items", IsEssential = false }
            }
        });

        // Pet supplies if traveling with pets
        if (hasPets)
        {
            categories.Add(new PackingCategoryDto
            {
                Category = "Pet Supplies",
                Icon = "paw",
                Items = new List<PackingItemDto>
                {
                    new() { Name = "Pet food & treats", IsEssential = true },
                    new() { Name = "Food & water bowls", IsEssential = true },
                    new() { Name = "Leash & collar with ID tags", IsEssential = true },
                    new() { Name = "Pet bed or blanket", IsEssential = false },
                    new() { Name = "Waste bags", IsEssential = true },
                    new() { Name = "Pet medications", IsEssential = true },
                    new() { Name = "Favorite toys", IsEssential = false },
                    new() { Name = "Pet first aid kit", IsEssential = false }
                }
            });
        }

        return categories;
    }

    private static string GetPhaseMessage(TripPhase phase, int daysUntil, string propertyName)
    {
        return phase switch
        {
            TripPhase.Planning => $"Your adventure to {propertyName} is coming up! Start dreaming about beach days.",
            TripPhase.Preparing => $"Time to start preparing! Your trip to {propertyName} is getting closer.",
            TripPhase.Countdown => daysUntil == 1
                ? $"Tomorrow is the day! Get ready for {propertyName}!"
                : $"Only {daysUntil} days until you're relaxing at {propertyName}!",
            TripPhase.CheckInDay => $"Today's the day! Welcome to {propertyName}. Have an amazing stay!",
            TripPhase.OnTrip => $"You're on vacation! Enjoy every moment at {propertyName}.",
            TripPhase.Completed => $"We hope you loved your stay at {propertyName}. See you next time!",
            _ => "Your Hatteras Island adventure awaits!"
        };
    }
}

public enum TripPhase
{
    Planning,
    Preparing,
    Countdown,
    CheckInDay,
    OnTrip,
    Completed
}

// DTOs
public class TripDashboardDto
{
    public string ReservationId { get; set; } = "";
    public PropertySummaryDto Property { get; set; } = new();
    public CountdownDto Countdown { get; set; } = new();
    public List<MilestoneDto> Milestones { get; set; } = new();
    public List<WeatherDayDto> Weather { get; set; } = new();
    public List<ActivitySuggestionDto> Activities { get; set; } = new();
    public List<PackingCategoryDto> PackingList { get; set; } = new();
    public CheckInInfoDto CheckInInfo { get; set; } = new();
    public GuestCountDto Guests { get; set; } = new();
    public PaymentSummaryDto Payment { get; set; } = new();
}

public class TripSummaryDto
{
    public string ReservationId { get; set; } = "";
    public string PropertyName { get; set; } = "";
    public string PropertySlug { get; set; } = "";
    public string? PropertyImage { get; set; }
    public string? Village { get; set; }
    public string CheckIn { get; set; } = "";
    public string CheckOut { get; set; } = "";
    public int DaysUntil { get; set; }
    public string Status { get; set; } = "";
    public bool IsCurrentTrip { get; set; }
}

public class PropertySummaryDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string? Village { get; set; }
    public int Bedrooms { get; set; }
    public decimal Bathrooms { get; set; }
    public int Sleeps { get; set; }
    public string? PrimaryImage { get; set; }
    public string? Address { get; set; }
}

public class CountdownDto
{
    public int DaysUntilTrip { get; set; }
    public int TripDuration { get; set; }
    public string CheckInDate { get; set; } = "";
    public string CheckOutDate { get; set; } = "";
    public string Phase { get; set; } = "";
    public string PhaseMessage { get; set; } = "";
}

public class MilestoneDto
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Date { get; set; } = "";
    public int DaysFromNow { get; set; }
    public string Icon { get; set; } = "";
    public bool IsCompleted { get; set; }
    public bool IsCurrent { get; set; }
}

public class WeatherDayDto
{
    public string Date { get; set; } = "";
    public string DayOfWeek { get; set; } = "";
    public string Condition { get; set; } = "";
    public string Icon { get; set; } = "";
    public int HighTemp { get; set; }
    public int LowTemp { get; set; }
    public int PrecipChance { get; set; }
    public int Humidity { get; set; }
    public int WindSpeed { get; set; }
    public int UvIndex { get; set; }
}

public class ActivitySuggestionDto
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Duration { get; set; } = "";
    public string Distance { get; set; } = "";
}

public class PackingCategoryDto
{
    public string Category { get; set; } = "";
    public string Icon { get; set; } = "";
    public List<PackingItemDto> Items { get; set; } = new();
}

public class PackingItemDto
{
    public string Name { get; set; } = "";
    public bool IsEssential { get; set; }
    public bool IsPacked { get; set; }
}

public class CheckInInfoDto
{
    public string Date { get; set; } = "";
    public string Time { get; set; } = "";
    public string Address { get; set; } = "";
    public string? Instructions { get; set; }
    public string? WifiName { get; set; }
    public string? WifiPassword { get; set; }
    public string? ParkingInstructions { get; set; }
    public string? DoorCode { get; set; }
}

public class GuestCountDto
{
    public int Adults { get; set; }
    public int Children { get; set; }
    public int Pets { get; set; }
    public int Total { get; set; }
}

public class PaymentSummaryDto
{
    public decimal TotalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal AmountDue { get; set; }
    public string Status { get; set; } = "";
    public string DueDate { get; set; } = "";
}
