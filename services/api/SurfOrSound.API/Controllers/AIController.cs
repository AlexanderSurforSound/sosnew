using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers;

/// <summary>
/// Sandy AI Concierge - Enhanced features for property search, trip planning, and local recommendations
/// </summary>
[ApiController]
[Route("api/v1/ai")]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly ICacheService _cacheService;
    private readonly ILogger<AIController> _logger;

    public AIController(
        IAIService aiService,
        ICacheService cacheService,
        ILogger<AIController> logger)
    {
        _aiService = aiService;
        _cacheService = cacheService;
        _logger = logger;
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }

    /// <summary>
    /// Natural language property search powered by AI
    /// </summary>
    /// <remarks>
    /// Search for properties using natural language queries like:
    /// - "I need a pet-friendly house with a pool near Avon"
    /// - "Large oceanfront home for our family reunion, at least 6 bedrooms"
    /// - "Romantic getaway with hot tub and ocean views"
    /// </remarks>
    [HttpPost("search")]
    [AllowAnonymous]
    public async Task<ActionResult<SemanticSearchResponse>> SemanticSearch(
        [FromBody] SemanticSearchRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return BadRequest(new { message = "Search query is required" });
        }

        if (request.Query.Length > 500)
        {
            return BadRequest(new { message = "Query is too long (max 500 characters)" });
        }

        try
        {
            // Check cache for similar queries
            var cacheKey = $"ai-search:{request.Query.ToLowerInvariant().GetHashCode()}:{request.CheckIn}:{request.CheckOut}";
            var cached = await _cacheService.GetAsync<SemanticSearchResponse>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Returning cached search results for query: {Query}", request.Query);
                return Ok(cached);
            }

            request.GuestId = GetUserId();

            var response = await _aiService.SemanticSearchAsync(request, ct);

            // Cache for 5 minutes
            await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromMinutes(5));

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing semantic search: {Query}", request.Query);
            return StatusCode(500, new { message = "Sorry, I had trouble processing your search. Please try again." });
        }
    }

    /// <summary>
    /// Dream vacation property matcher
    /// </summary>
    /// <remarks>
    /// Describe your dream vacation and let Sandy find the perfect property matches.
    /// More detailed descriptions yield better results.
    /// </remarks>
    [HttpPost("dream-match")]
    [AllowAnonymous]
    public async Task<ActionResult<DreamMatcherResponse>> DreamMatch(
        [FromBody] DreamMatcherRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return BadRequest(new { message = "Please describe your dream vacation" });
        }

        try
        {
            var response = await _aiService.MatchDreamVacationAsync(request, ct);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing dream match: {Query}", request.Query);
            return StatusCode(500, new { message = "Sorry, I had trouble finding matches. Please try again." });
        }
    }

    /// <summary>
    /// Generate a personalized trip itinerary
    /// </summary>
    /// <remarks>
    /// Create a day-by-day vacation itinerary based on your interests, party composition,
    /// and the village you're staying in. Includes activities, dining recommendations, and local tips.
    /// </remarks>
    [HttpPost("itinerary")]
    [AllowAnonymous]
    public async Task<ActionResult<ItineraryResponse>> GenerateItinerary(
        [FromBody] ItineraryRequest request,
        CancellationToken ct)
    {
        if (request.CheckIn == default || request.CheckOut == default)
        {
            return BadRequest(new { message = "Check-in and check-out dates are required" });
        }

        if (request.CheckOut <= request.CheckIn)
        {
            return BadRequest(new { message = "Check-out must be after check-in" });
        }

        if (request.NumberOfDays > 14)
        {
            return BadRequest(new { message = "Itineraries are limited to 14 days" });
        }

        try
        {
            request.GuestId = GetUserId();

            var response = await _aiService.GenerateItineraryAsync(request, ct);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating itinerary");
            return StatusCode(500, new { message = "Sorry, I had trouble creating your itinerary. Please try again." });
        }
    }

    /// <summary>
    /// Get personalized recommendations
    /// </summary>
    /// <remarks>
    /// Get AI-powered recommendations for restaurants, activities, beaches, shopping, and attractions
    /// near your vacation rental. Recommendations are personalized based on your interests and party.
    /// </remarks>
    [HttpPost("recommendations")]
    [AllowAnonymous]
    public async Task<ActionResult<RecommendationsResponse>> GetRecommendations(
        [FromBody] RecommendationsRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Type))
        {
            return BadRequest(new { message = "Recommendation type is required (restaurants, activities, beaches, shopping, attractions)" });
        }

        var validTypes = new[] { "restaurants", "activities", "beaches", "shopping", "attractions", "all" };
        if (!validTypes.Contains(request.Type.ToLowerInvariant()))
        {
            return BadRequest(new { message = $"Invalid type. Must be one of: {string.Join(", ", validTypes)}" });
        }

        try
        {
            // Check cache
            var cacheKey = $"ai-recommendations:{request.Type}:{request.Village}:{request.PartyComposition}";
            var cached = await _cacheService.GetAsync<RecommendationsResponse>(cacheKey);
            if (cached != null)
            {
                return Ok(cached);
            }

            var response = await _aiService.GetRecommendationsAsync(request, ct);

            // Cache for 1 hour (recommendations don't change often)
            await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromHours(1));

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations for {Type} in {Village}", request.Type, request.Village);
            return StatusCode(500, new { message = "Sorry, I had trouble getting recommendations. Please try again." });
        }
    }

    /// <summary>
    /// Get trip insights for an upcoming reservation
    /// </summary>
    /// <remarks>
    /// Returns helpful pre-trip information including weather outlook, packing suggestions,
    /// local tips, emergency info, and must-do activities.
    /// </remarks>
    [HttpGet("insights/{reservationId:guid}")]
    [Authorize]
    public async Task<ActionResult<TripInsightsResponse>> GetTripInsights(
        Guid reservationId,
        CancellationToken ct)
    {
        try
        {
            var guestId = GetUserId();

            // Check cache
            var cacheKey = $"ai-insights:{reservationId}";
            var cached = await _cacheService.GetAsync<TripInsightsResponse>(cacheKey);
            if (cached != null)
            {
                return Ok(cached);
            }

            var response = await _aiService.GetTripInsightsAsync(reservationId, guestId, ct);

            // Cache for 6 hours (weather and tips don't change frequently)
            await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromHours(6));

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trip insights for reservation {ReservationId}", reservationId);
            return StatusCode(500, new { message = "Sorry, I had trouble getting your trip insights. Please try again." });
        }
    }

    /// <summary>
    /// Quick recommendations for a specific village
    /// </summary>
    [HttpGet("quick-tips/{village}")]
    [AllowAnonymous]
    public async Task<ActionResult<QuickTipsResponse>> GetQuickTips(
        string village,
        CancellationToken ct)
    {
        var validVillages = new[] { "rodanthe", "waves", "salvo", "avon", "buxton", "frisco", "hatteras-village" };
        var normalizedVillage = village.ToLowerInvariant().Replace(" ", "-");

        if (!validVillages.Contains(normalizedVillage))
        {
            return BadRequest(new { message = $"Invalid village. Must be one of: {string.Join(", ", validVillages)}" });
        }

        try
        {
            // Check cache
            var cacheKey = $"ai-quick-tips:{normalizedVillage}";
            var cached = await _cacheService.GetAsync<QuickTipsResponse>(cacheKey);
            if (cached != null)
            {
                return Ok(cached);
            }

            // Get recommendations for multiple categories
            var restaurantsTask = _aiService.GetRecommendationsAsync(new RecommendationsRequest
            {
                Type = "restaurants",
                Village = normalizedVillage,
                MaxResults = 3
            }, ct);

            var activitiesTask = _aiService.GetRecommendationsAsync(new RecommendationsRequest
            {
                Type = "activities",
                Village = normalizedVillage,
                MaxResults = 3
            }, ct);

            await Task.WhenAll(restaurantsTask, activitiesTask);

            var response = new QuickTipsResponse
            {
                Village = normalizedVillage,
                TopRestaurants = restaurantsTask.Result.Recommendations.Take(3).ToList(),
                TopActivities = activitiesTask.Result.Recommendations.Take(3).ToList(),
                LocalTip = restaurantsTask.Result.LocalTip
            };

            // Cache for 2 hours
            await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromHours(2));

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting quick tips for {Village}", village);
            return StatusCode(500, new { message = "Sorry, I had trouble getting tips. Please try again." });
        }
    }

    /// <summary>
    /// Ask Sandy a question about Hatteras Island
    /// </summary>
    /// <remarks>
    /// Quick Q&A endpoint for simple questions about the area, without maintaining conversation history.
    /// For conversational interactions, use the /chat endpoint instead.
    /// </remarks>
    [HttpPost("ask")]
    [AllowAnonymous]
    public async Task<ActionResult<QuickAnswerResponse>> AskQuestion(
        [FromBody] QuickQuestionRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
        {
            return BadRequest(new { message = "Question is required" });
        }

        if (request.Question.Length > 300)
        {
            return BadRequest(new { message = "Question is too long (max 300 characters)" });
        }

        try
        {
            // Use the chat service but don't persist the conversation
            var chatResponse = await _aiService.ChatAsync(new ChatRequest
            {
                Message = request.Question,
                SessionId = "quick-ask-" + Guid.NewGuid().ToString("N")[..8],
                Context = request.Context != null ? new ChatContext
                {
                    PropertyId = request.Context.PropertyId,
                    Page = request.Context.Page
                } : null
            }, ct);

            return Ok(new QuickAnswerResponse
            {
                Question = request.Question,
                Answer = chatResponse.Message,
                SuggestedFollowUps = chatResponse.SuggestedActions
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing quick question: {Question}", request.Question);
            return StatusCode(500, new { message = "Sorry, I had trouble answering that. Please try again." });
        }
    }
}

// Additional DTOs for AI Controller
public class QuickTipsResponse
{
    public string Village { get; set; } = "";
    public List<Recommendation> TopRestaurants { get; set; } = new();
    public List<Recommendation> TopActivities { get; set; } = new();
    public string LocalTip { get; set; } = "";
}

public class QuickQuestionRequest
{
    public string Question { get; set; } = "";
    public QuickQuestionContext? Context { get; set; }
}

public class QuickQuestionContext
{
    public string? PropertyId { get; set; }
    public string? Page { get; set; }
}

public class QuickAnswerResponse
{
    public string Question { get; set; } = "";
    public string Answer { get; set; } = "";
    public List<string>? SuggestedFollowUps { get; set; }
}
