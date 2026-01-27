using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Services;

public interface IReviewService
{
    Task<ReviewListDto> GetPropertyReviewsAsync(string propertyId, int page = 1, int pageSize = 10, CancellationToken ct = default);
    Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, Guid guestId, CancellationToken ct = default);
    Task<ReviewStatsDto> GetPropertyReviewStatsAsync(string propertyId, CancellationToken ct = default);
    Task<bool> MarkReviewHelpfulAsync(Guid reviewId, Guid? guestId, string? sessionId, CancellationToken ct = default);
}

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(AppDbContext db, ILogger<ReviewService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ReviewListDto> GetPropertyReviewsAsync(string propertyId, int page = 1, int pageSize = 10, CancellationToken ct = default)
    {
        var query = _db.Reviews
            .Where(r => r.PropertyId == propertyId && r.IsPublished)
            .Include(r => r.Guest)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync(ct);

        var reviews = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                OverallRating = r.OverallRating,
                CleanlinessRating = r.CleanlinessRating,
                AccuracyRating = r.AccuracyRating,
                CommunicationRating = r.CommunicationRating,
                LocationRating = r.LocationRating,
                ValueRating = r.ValueRating,
                Title = r.Title,
                Content = r.Content,
                OwnerResponse = r.OwnerResponse,
                OwnerResponseDate = r.OwnerResponseDate,
                StayDate = r.StayDate,
                TripType = r.TripType,
                IsVerified = r.IsVerified,
                HelpfulCount = r.HelpfulCount,
                CreatedAt = r.CreatedAt,
                Guest = r.Guest != null ? new ReviewGuestDto
                {
                    FirstName = r.Guest.FirstName,
                    LastInitial = !string.IsNullOrEmpty(r.Guest.LastName) ? r.Guest.LastName[0].ToString() : null,
                    Location = r.Guest.City != null && r.Guest.State != null
                        ? $"{r.Guest.City}, {r.Guest.State}"
                        : null
                } : null
            })
            .ToListAsync(ct);

        return new ReviewListDto
        {
            Reviews = reviews,
            Total = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, Guid guestId, CancellationToken ct = default)
    {
        var guest = await _db.Guests.FindAsync(new object[] { guestId }, ct);
        if (guest == null)
            throw new UnauthorizedAccessException("Guest not found");

        // Check if guest already reviewed this property
        var existingReview = await _db.Reviews
            .FirstOrDefaultAsync(r => r.PropertyId == request.PropertyId && r.GuestId == guestId, ct);

        if (existingReview != null)
            throw new InvalidOperationException("You have already reviewed this property");

        var review = new Review
        {
            PropertyId = request.PropertyId,
            GuestId = guestId,
            ReservationId = request.ReservationId,
            OverallRating = request.OverallRating,
            CleanlinessRating = request.CleanlinessRating,
            AccuracyRating = request.AccuracyRating,
            CommunicationRating = request.CommunicationRating,
            LocationRating = request.LocationRating,
            ValueRating = request.ValueRating,
            Title = request.Title,
            Content = request.Content,
            StayDate = request.StayDate,
            TripType = request.TripType,
            IsVerified = !string.IsNullOrEmpty(request.ReservationId), // Verified if linked to reservation
            IsPublished = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Review created for property {PropertyId} by guest {GuestId}", request.PropertyId, guestId);

        return new ReviewDto
        {
            Id = review.Id,
            OverallRating = review.OverallRating,
            CleanlinessRating = review.CleanlinessRating,
            AccuracyRating = review.AccuracyRating,
            CommunicationRating = review.CommunicationRating,
            LocationRating = review.LocationRating,
            ValueRating = review.ValueRating,
            Title = review.Title,
            Content = review.Content,
            StayDate = review.StayDate,
            TripType = review.TripType,
            IsVerified = review.IsVerified,
            HelpfulCount = 0,
            CreatedAt = review.CreatedAt,
            Guest = new ReviewGuestDto
            {
                FirstName = guest.FirstName,
                LastInitial = !string.IsNullOrEmpty(guest.LastName) ? guest.LastName[0].ToString() : null
            }
        };
    }

    public async Task<ReviewStatsDto> GetPropertyReviewStatsAsync(string propertyId, CancellationToken ct = default)
    {
        var reviews = await _db.Reviews
            .Where(r => r.PropertyId == propertyId && r.IsPublished)
            .ToListAsync(ct);

        if (reviews.Count == 0)
        {
            return new ReviewStatsDto
            {
                AverageRating = 0,
                TotalReviews = 0,
                RatingDistribution = new Dictionary<int, int>
                {
                    { 5, 0 }, { 4, 0 }, { 3, 0 }, { 2, 0 }, { 1, 0 }
                }
            };
        }

        var avgOverall = reviews.Average(r => r.OverallRating);
        var avgCleanliness = reviews.Where(r => r.CleanlinessRating.HasValue).Select(r => r.CleanlinessRating!.Value).DefaultIfEmpty(0).Average();
        var avgAccuracy = reviews.Where(r => r.AccuracyRating.HasValue).Select(r => r.AccuracyRating!.Value).DefaultIfEmpty(0).Average();
        var avgCommunication = reviews.Where(r => r.CommunicationRating.HasValue).Select(r => r.CommunicationRating!.Value).DefaultIfEmpty(0).Average();
        var avgLocation = reviews.Where(r => r.LocationRating.HasValue).Select(r => r.LocationRating!.Value).DefaultIfEmpty(0).Average();
        var avgValue = reviews.Where(r => r.ValueRating.HasValue).Select(r => r.ValueRating!.Value).DefaultIfEmpty(0).Average();

        var distribution = reviews
            .GroupBy(r => r.OverallRating)
            .ToDictionary(g => g.Key, g => g.Count());

        // Ensure all ratings 1-5 are present
        for (int i = 1; i <= 5; i++)
        {
            if (!distribution.ContainsKey(i))
                distribution[i] = 0;
        }

        return new ReviewStatsDto
        {
            AverageRating = Math.Round(avgOverall, 1),
            TotalReviews = reviews.Count,
            AverageCleanliness = avgCleanliness > 0 ? Math.Round(avgCleanliness, 1) : null,
            AverageAccuracy = avgAccuracy > 0 ? Math.Round(avgAccuracy, 1) : null,
            AverageCommunication = avgCommunication > 0 ? Math.Round(avgCommunication, 1) : null,
            AverageLocation = avgLocation > 0 ? Math.Round(avgLocation, 1) : null,
            AverageValue = avgValue > 0 ? Math.Round(avgValue, 1) : null,
            RatingDistribution = distribution
        };
    }

    public async Task<bool> MarkReviewHelpfulAsync(Guid reviewId, Guid? guestId, string? sessionId, CancellationToken ct = default)
    {
        // Check if already marked helpful
        var existing = await _db.Set<ReviewHelpful>()
            .FirstOrDefaultAsync(h =>
                h.ReviewId == reviewId &&
                ((guestId.HasValue && h.GuestId == guestId) ||
                 (!string.IsNullOrEmpty(sessionId) && h.SessionId == sessionId)), ct);

        if (existing != null)
            return false;

        var helpful = new ReviewHelpful
        {
            ReviewId = reviewId,
            GuestId = guestId,
            SessionId = sessionId
        };

        _db.Set<ReviewHelpful>().Add(helpful);

        // Increment helpful count
        var review = await _db.Reviews.FindAsync(new object[] { reviewId }, ct);
        if (review != null)
        {
            review.HelpfulCount++;
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }
}

// DTOs
public class ReviewListDto
{
    public List<ReviewDto> Reviews { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public int OverallRating { get; set; }
    public int? CleanlinessRating { get; set; }
    public int? AccuracyRating { get; set; }
    public int? CommunicationRating { get; set; }
    public int? LocationRating { get; set; }
    public int? ValueRating { get; set; }
    public string? Title { get; set; }
    public string Content { get; set; } = "";
    public string? OwnerResponse { get; set; }
    public DateTime? OwnerResponseDate { get; set; }
    public DateTime StayDate { get; set; }
    public string? TripType { get; set; }
    public bool IsVerified { get; set; }
    public int HelpfulCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public ReviewGuestDto? Guest { get; set; }
}

public class ReviewGuestDto
{
    public string FirstName { get; set; } = "";
    public string? LastInitial { get; set; }
    public string? Location { get; set; }
}

public class ReviewStatsDto
{
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public double? AverageCleanliness { get; set; }
    public double? AverageAccuracy { get; set; }
    public double? AverageCommunication { get; set; }
    public double? AverageLocation { get; set; }
    public double? AverageValue { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = new();
}

public class CreateReviewRequest
{
    public string PropertyId { get; set; } = "";
    public string? ReservationId { get; set; }
    public int OverallRating { get; set; }
    public int? CleanlinessRating { get; set; }
    public int? AccuracyRating { get; set; }
    public int? CommunicationRating { get; set; }
    public int? LocationRating { get; set; }
    public int? ValueRating { get; set; }
    public string? Title { get; set; }
    public string Content { get; set; } = "";
    public DateTime StayDate { get; set; }
    public string? TripType { get; set; }
}
