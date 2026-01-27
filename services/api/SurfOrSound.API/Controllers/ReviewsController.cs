using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers;

[ApiController]
[Route("api/v1/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly ILogger<ReviewsController> _logger;

    public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
    {
        _reviewService = reviewService;
        _logger = logger;
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }

    /// <summary>
    /// Get reviews for a property
    /// </summary>
    [HttpGet("property/{propertyId}")]
    public async Task<ActionResult<ReviewListDto>> GetPropertyReviews(
        string propertyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var reviews = await _reviewService.GetPropertyReviewsAsync(propertyId, page, Math.Min(pageSize, 50));
        return Ok(reviews);
    }

    /// <summary>
    /// Get review statistics for a property
    /// </summary>
    [HttpGet("property/{propertyId}/stats")]
    public async Task<ActionResult<ReviewStatsDto>> GetPropertyReviewStats(string propertyId)
    {
        var stats = await _reviewService.GetPropertyReviewStatsAsync(propertyId);
        return Ok(stats);
    }

    /// <summary>
    /// Create a new review
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] CreateReviewRequest request)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized();

        // Validate rating
        if (request.OverallRating < 1 || request.OverallRating > 5)
            return BadRequest(new { message = "Rating must be between 1 and 5" });

        if (string.IsNullOrWhiteSpace(request.Content) || request.Content.Length < 20)
            return BadRequest(new { message = "Review must be at least 20 characters" });

        if (request.Content.Length > 2000)
            return BadRequest(new { message = "Review cannot exceed 2000 characters" });

        try
        {
            var review = await _reviewService.CreateReviewAsync(request, userId.Value);
            return Created($"/api/v1/reviews/{review.Id}", review);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Mark a review as helpful
    /// </summary>
    [HttpPost("{reviewId}/helpful")]
    public async Task<IActionResult> MarkHelpful(Guid reviewId, [FromQuery] string? sessionId)
    {
        var userId = GetUserId();

        if (!userId.HasValue && string.IsNullOrEmpty(sessionId))
            return BadRequest(new { message = "Session ID required for anonymous users" });

        var success = await _reviewService.MarkReviewHelpfulAsync(reviewId, userId, sessionId);

        if (!success)
            return Conflict(new { message = "You have already marked this review as helpful" });

        return Ok(new { message = "Thank you for your feedback" });
    }
}
