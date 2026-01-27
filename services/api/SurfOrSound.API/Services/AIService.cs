using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Services;

public interface IAIService
{
    Task<ChatResponse> ChatAsync(ChatRequest request, CancellationToken ct = default);
    Task<List<ConversationSummary>> GetConversationsAsync(Guid? guestId, string? sessionId, CancellationToken ct = default);
    Task<ConversationDetail?> GetConversationAsync(Guid conversationId, CancellationToken ct = default);
    Task DeleteConversationAsync(Guid conversationId, CancellationToken ct = default);
    Task<DreamMatcherResponse> MatchDreamVacationAsync(DreamMatcherRequest request, CancellationToken ct = default);

    // Enhanced AI Concierge Features
    Task<ItineraryResponse> GenerateItineraryAsync(ItineraryRequest request, CancellationToken ct = default);
    Task<RecommendationsResponse> GetRecommendationsAsync(RecommendationsRequest request, CancellationToken ct = default);
    Task<TripInsightsResponse> GetTripInsightsAsync(Guid reservationId, Guid? guestId, CancellationToken ct = default);
    Task<SemanticSearchResponse> SemanticSearchAsync(SemanticSearchRequest request, CancellationToken ct = default);
}

public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _db;
    private readonly IPropertyService _propertyService;
    private readonly ILogger<AIService> _logger;
    private readonly string _apiKey;
    private readonly string _model;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public AIService(
        IHttpClientFactory httpClientFactory,
        AppDbContext db,
        IPropertyService propertyService,
        IConfiguration config,
        ILogger<AIService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.BaseAddress = new Uri("https://api.anthropic.com/");
        _db = db;
        _propertyService = propertyService;
        _logger = logger;
        _apiKey = config["Claude:ApiKey"] ?? throw new InvalidOperationException("Claude:ApiKey not configured");
        _model = config["Claude:Model"] ?? "claude-sonnet-4-20250514";
    }

    public async Task<ChatResponse> ChatAsync(ChatRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Processing chat message for session {SessionId}", request.SessionId);

        // Get or create conversation
        var conversation = await GetOrCreateConversationAsync(request, ct);

        // Build context from property data if relevant
        var context = await BuildContextAsync(request, ct);

        // Get conversation history
        var history = await _db.ConversationMessages
            .Where(m => m.ConversationId == conversation.Id)
            .OrderBy(m => m.CreatedAt)
            .TakeLast(20)
            .ToListAsync(ct);

        // Build messages for Claude
        var messages = new List<ClaudeMessage>();

        foreach (var msg in history)
        {
            messages.Add(new ClaudeMessage
            {
                Role = msg.Role,
                Content = msg.Content
            });
        }

        // Add the new user message
        messages.Add(new ClaudeMessage
        {
            Role = "user",
            Content = request.Message
        });

        // Call Claude API
        var claudeRequest = new ClaudeRequest
        {
            Model = _model,
            MaxTokens = 1024,
            System = GetSystemPrompt(context),
            Messages = messages
        };

        var response = await CallClaudeAsync(claudeRequest, ct);

        // Save messages to database
        var userMessage = new ConversationMessage
        {
            ConversationId = conversation.Id,
            Role = "user",
            Content = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        var assistantMessage = new ConversationMessage
        {
            ConversationId = conversation.Id,
            Role = "assistant",
            Content = response.Content,
            Metadata = JsonSerializer.Serialize(new {
                model = _model,
                inputTokens = response.InputTokens,
                outputTokens = response.OutputTokens
            }),
            CreatedAt = DateTime.UtcNow
        };

        _db.ConversationMessages.Add(userMessage);
        _db.ConversationMessages.Add(assistantMessage);

        // Update conversation
        conversation.UpdatedAt = DateTime.UtcNow;
        if (string.IsNullOrEmpty(conversation.Title) || conversation.Title == "New Conversation")
        {
            conversation.Title = GenerateTitle(request.Message);
        }

        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Chat response generated for conversation {ConversationId}", conversation.Id);

        return new ChatResponse
        {
            ConversationId = conversation.Id,
            Message = response.Content,
            SuggestedActions = ExtractSuggestedActions(response.Content)
        };
    }

    public async Task<List<ConversationSummary>> GetConversationsAsync(
        Guid? guestId,
        string? sessionId,
        CancellationToken ct = default)
    {
        var query = _db.Conversations.AsQueryable();

        if (guestId.HasValue)
        {
            query = query.Where(c => c.GuestId == guestId);
        }
        else if (!string.IsNullOrEmpty(sessionId))
        {
            query = query.Where(c => c.SessionId == sessionId);
        }
        else
        {
            return new List<ConversationSummary>();
        }

        return await query
            .OrderByDescending(c => c.UpdatedAt)
            .Take(20)
            .Select(c => new ConversationSummary
            {
                Id = c.Id,
                Title = c.Title,
                Status = c.Status,
                LastMessageAt = c.UpdatedAt,
                MessageCount = c.Messages.Count
            })
            .ToListAsync(ct);
    }

    public async Task<ConversationDetail?> GetConversationAsync(Guid conversationId, CancellationToken ct = default)
    {
        var conversation = await _db.Conversations
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == conversationId, ct);

        if (conversation == null) return null;

        return new ConversationDetail
        {
            Id = conversation.Id,
            Title = conversation.Title,
            Status = conversation.Status,
            Messages = conversation.Messages.Select(m => new MessageDto
            {
                Id = m.Id,
                Role = m.Role,
                Content = m.Content,
                CreatedAt = m.CreatedAt
            }).ToList(),
            CreatedAt = conversation.CreatedAt
        };
    }

    public async Task DeleteConversationAsync(Guid conversationId, CancellationToken ct = default)
    {
        var conversation = await _db.Conversations.FindAsync(new object[] { conversationId }, ct);
        if (conversation != null)
        {
            _db.Conversations.Remove(conversation);
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<DreamMatcherResponse> MatchDreamVacationAsync(DreamMatcherRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Processing dream vacation match request: {Query}", request.Query);

        // Step 1: Use Claude to extract search criteria from natural language
        var criteria = await ExtractSearchCriteriaAsync(request.Query, ct);

        // Step 2: Fetch all properties and filter based on extracted criteria
        var queryParams = new Models.DTOs.PropertyQueryParams
        {
            Village = criteria.PreferredVillage,
            MinBedrooms = criteria.MinBedrooms,
            MaxBedrooms = criteria.MaxBedrooms,
            PetFriendly = criteria.PetFriendly,
            Amenities = criteria.RequiredAmenities,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            Guests = criteria.Guests,
            PageSize = 100
        };

        var propertiesResult = await _propertyService.GetPropertiesAsync(queryParams, null);
        var allProperties = propertiesResult.Items;

        // Step 3: Score and rank properties based on how well they match the dream description
        var scoredProperties = await ScorePropertiesAsync(request.Query, criteria, allProperties, ct);

        // Step 4: Generate personalized insights for top matches
        var topMatches = scoredProperties.Take(request.MaxResults).ToList();
        var matchesWithInsights = await GenerateMatchInsightsAsync(request.Query, topMatches, ct);

        return new DreamMatcherResponse
        {
            Matches = matchesWithInsights,
            SearchCriteria = criteria,
            TotalPropertiesAnalyzed = allProperties.Count,
            Summary = GenerateSearchSummary(criteria, matchesWithInsights.Count, allProperties.Count)
        };
    }

    public async Task<ItineraryResponse> GenerateItineraryAsync(ItineraryRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Generating itinerary for reservation {ReservationId}", request.ReservationId);

        // Build context about the trip
        var tripContext = await BuildTripContextAsync(request, ct);

        var systemPrompt = @"You are Sandy, the AI concierge for Surf or Sound Realty on Hatteras Island, NC.
Generate a personalized daily itinerary for a guest's vacation.

Consider:
- The village they're staying in and nearby attractions
- Their interests and party composition (families, couples, groups)
- Weather-appropriate activities
- Mix of beach time, activities, dining, and relaxation
- Local hidden gems and insider tips

Format each day with morning, afternoon, and evening activities.
Be specific with restaurant names, activity locations, and tips.

Respond with JSON in this format:
{
  ""title"": ""Your Hatteras Island Adventure"",
  ""overview"": ""Brief trip overview"",
  ""days"": [
    {
      ""dayNumber"": 1,
      ""date"": ""2024-07-15"",
      ""theme"": ""Arrival & Beach Day"",
      ""activities"": [
        {
          ""timeSlot"": ""morning"",
          ""title"": ""Activity name"",
          ""description"": ""What to do"",
          ""location"": ""Where"",
          ""duration"": ""2 hours"",
          ""type"": ""beach|dining|activity|relaxation|sightseeing"",
          ""tip"": ""Insider tip""
        }
      ]
    }
  ],
  ""packingList"": [""sunscreen"", ""beach chairs""],
  ""diningRecommendations"": [
    {
      ""name"": ""Restaurant name"",
      ""cuisine"": ""Seafood"",
      ""priceRange"": ""$$"",
      ""bestFor"": ""Sunset dinner"",
      ""village"": ""Avon""
    }
  ]
}";

        var userPrompt = $@"Create a {request.NumberOfDays}-day itinerary for this trip:

Property: {tripContext.PropertyName} in {tripContext.Village}
Check-in: {request.CheckIn:yyyy-MM-dd}
Check-out: {request.CheckOut:yyyy-MM-dd}
Group: {request.PartySize} guests
Interests: {string.Join(", ", request.Interests ?? new List<string> { "beach", "relaxation" })}
Special requests: {request.SpecialRequests ?? "None"}

Property amenities: {string.Join(", ", tripContext.Amenities)}";

        var response = await CallClaudeAsync(new ClaudeRequest
        {
            Model = _model,
            MaxTokens = 4000,
            System = systemPrompt,
            Messages = new List<ClaudeMessage> { new() { Role = "user", Content = userPrompt } }
        }, ct);

        try
        {
            var jsonStart = response.Content.IndexOf('{');
            var jsonEnd = response.Content.LastIndexOf('}') + 1;
            var jsonContent = response.Content[jsonStart..jsonEnd];

            var itinerary = JsonSerializer.Deserialize<ItineraryResponse>(jsonContent, JsonOptions);
            if (itinerary != null)
            {
                itinerary.GeneratedAt = DateTime.UtcNow;
                itinerary.ReservationId = request.ReservationId;

                // Save to database if guest is logged in
                if (request.GuestId.HasValue)
                {
                    await SaveItineraryAsync(request.GuestId.Value, request.ReservationId, itinerary, ct);
                }

                return itinerary;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse itinerary response");
        }

        return new ItineraryResponse
        {
            Title = "Your Hatteras Island Getaway",
            Overview = "Enjoy your stay on beautiful Hatteras Island!",
            GeneratedAt = DateTime.UtcNow
        };
    }

    public async Task<RecommendationsResponse> GetRecommendationsAsync(RecommendationsRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Getting recommendations for type {Type} in {Village}", request.Type, request.Village);

        var systemPrompt = $@"You are Sandy, the local expert AI concierge for Hatteras Island, NC.
Provide personalized recommendations for {request.Type}.

HATTERAS ISLAND KNOWLEDGE:
- Rodanthe: Chicamacomico Lifesaving Station, ""Nights in Rodanthe"" house
- Waves: Kiteboarding hub, Rodanthe-Waves-Salvo community center
- Salvo: Great beach access, family-friendly
- Avon: Largest village - Avon Pier, shops, restaurants, Koru Village
- Buxton: Cape Hatteras Lighthouse, Canadian Hole for windsports, surf shops
- Frisco: Native American Museum, Billy Mitchell Airport, Frisco Pier
- Hatteras Village: Fishing charters, Ocracoke ferry, Graveyard of the Atlantic Museum

POPULAR SPOTS BY CATEGORY:
Restaurants: Pangea Tavern (Nags Head), Rusty's Surf & Turf (Buxton), Cafe Pamlico (Buxton), Dinky's (Avon), Good Winds (Avon)
Activities: Lighthouse climbing, Kiteboarding lessons, Kayak tours, Fishing charters, Wild horse tours
Beaches: Beach access ramps vary by village - recommend specific ones based on location

Respond with JSON:
{{
  ""category"": ""{request.Type}"",
  ""recommendations"": [
    {{
      ""name"": ""Place name"",
      ""description"": ""Why it's great"",
      ""type"": ""restaurant|activity|beach|shopping|attraction"",
      ""village"": ""Village name"",
      ""address"": ""Address if known"",
      ""priceRange"": ""$|$$|$$$|$$$$"",
      ""bestTime"": ""When to visit"",
      ""insiderTip"": ""Local tip"",
      ""websiteUrl"": ""URL if known"",
      ""tags"": [""family-friendly"", ""romantic"", ""adventure""]
    }}
  ],
  ""localTip"": ""General tip for this category""
}}";

        var userPrompt = $@"Recommend {request.Type} near {request.Village ?? "Hatteras Island"}.

Context:
- Party composition: {request.PartyComposition ?? "General travelers"}
- Interests: {string.Join(", ", request.Interests ?? new List<string>())}
- Budget: {request.BudgetLevel ?? "Any"}
- Specific needs: {request.SpecificNeeds ?? "None"}

Give me {request.MaxResults} top recommendations.";

        var response = await CallClaudeAsync(new ClaudeRequest
        {
            Model = _model,
            MaxTokens = 2000,
            System = systemPrompt,
            Messages = new List<ClaudeMessage> { new() { Role = "user", Content = userPrompt } }
        }, ct);

        try
        {
            var jsonStart = response.Content.IndexOf('{');
            var jsonEnd = response.Content.LastIndexOf('}') + 1;
            var jsonContent = response.Content[jsonStart..jsonEnd];

            var recommendations = JsonSerializer.Deserialize<RecommendationsResponse>(jsonContent, JsonOptions);
            if (recommendations != null)
            {
                recommendations.Village = request.Village;
                recommendations.GeneratedAt = DateTime.UtcNow;
                return recommendations;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse recommendations response");
        }

        return new RecommendationsResponse
        {
            Category = request.Type,
            Recommendations = new List<Recommendation>(),
            LocalTip = "Ask our team for personalized recommendations!"
        };
    }

    public async Task<TripInsightsResponse> GetTripInsightsAsync(Guid reservationId, Guid? guestId, CancellationToken ct = default)
    {
        _logger.LogInformation("Getting trip insights for reservation {ReservationId}", reservationId);

        // In a real implementation, fetch reservation details from the database or Track PMS
        // For now, we'll generate insights based on context

        var systemPrompt = @"You are Sandy, the AI concierge. Generate helpful pre-trip insights and tips.

Create a comprehensive trip preparation guide including:
- Weather expectations for the season
- Packing suggestions
- Local tips and etiquette
- Things to know before arriving
- Emergency contacts and useful numbers

Respond with JSON:
{
  ""weatherOutlook"": {
    ""summary"": ""Weather summary"",
    ""avgHigh"": 85,
    ""avgLow"": 72,
    ""conditions"": ""Sunny with afternoon thunderstorms"",
    ""recommendations"": [""Bring sunscreen"", ""Pack rain jacket""]
  },
  ""packingEssentials"": [
    {
      ""item"": ""Item name"",
      ""reason"": ""Why you need it"",
      ""priority"": ""essential|recommended|optional""
    }
  ],
  ""arrivalTips"": [
    ""Tip for arriving""
  ],
  ""localInsights"": [
    {
      ""title"": ""Insight title"",
      ""description"": ""Description"",
      ""category"": ""dining|activities|beaches|shopping|safety""
    }
  ],
  ""emergencyInfo"": {
    ""nearestHospital"": ""Outer Banks Hospital, Nags Head"",
    ""urgentCare"": ""Outer Banks Urgent Care"",
    ""police"": ""Dare County Sheriff"",
    ""coastGuard"": ""Station Hatteras Inlet""
  },
  ""mustDos"": [
    {
      ""activity"": ""Activity name"",
      ""reason"": ""Why it's a must""
    }
  ]
}";

        var userPrompt = $@"Generate trip insights for a Hatteras Island vacation.
Reservation ID: {reservationId}
Season: Summer
Duration: 7 days";

        var response = await CallClaudeAsync(new ClaudeRequest
        {
            Model = _model,
            MaxTokens = 2500,
            System = systemPrompt,
            Messages = new List<ClaudeMessage> { new() { Role = "user", Content = userPrompt } }
        }, ct);

        try
        {
            var jsonStart = response.Content.IndexOf('{');
            var jsonEnd = response.Content.LastIndexOf('}') + 1;
            var jsonContent = response.Content[jsonStart..jsonEnd];

            var insights = JsonSerializer.Deserialize<TripInsightsResponse>(jsonContent, JsonOptions);
            if (insights != null)
            {
                insights.ReservationId = reservationId;
                insights.GeneratedAt = DateTime.UtcNow;
                return insights;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse trip insights response");
        }

        return new TripInsightsResponse
        {
            ReservationId = reservationId,
            GeneratedAt = DateTime.UtcNow
        };
    }

    public async Task<SemanticSearchResponse> SemanticSearchAsync(SemanticSearchRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Processing semantic search: {Query}", request.Query);

        // First, use Claude to understand the intent and extract parameters
        var intentPrompt = @"Analyze this vacation rental search query and extract the user's intent and preferences.

Respond with JSON:
{
  ""intent"": ""search|compare|availability|pricing|amenities|location"",
  ""sentiment"": ""excited|planning|researching|ready_to_book"",
  ""extractedParams"": {
    ""dates"": { ""checkIn"": ""YYYY-MM-DD"", ""checkOut"": ""YYYY-MM-DD"" },
    ""guests"": number,
    ""bedrooms"": { ""min"": number, ""max"": number },
    ""location"": ""village or area"",
    ""amenities"": [""required amenities""],
    ""budget"": ""budget|moderate|luxury"",
    ""tripType"": ""family|romantic|friends|solo|reunion""
  },
  ""followUpQuestions"": [""Clarifying questions to ask""],
  ""searchStrategy"": ""Description of how to best search""
}";

        var intentResponse = await CallClaudeAsync(new ClaudeRequest
        {
            Model = _model,
            MaxTokens = 500,
            System = intentPrompt,
            Messages = new List<ClaudeMessage> { new() { Role = "user", Content = request.Query } }
        }, ct);

        // Parse intent
        SearchIntent? intent = null;
        try
        {
            var jsonStart = intentResponse.Content.IndexOf('{');
            var jsonEnd = intentResponse.Content.LastIndexOf('}') + 1;
            var jsonContent = intentResponse.Content[jsonStart..jsonEnd];
            intent = JsonSerializer.Deserialize<SearchIntent>(jsonContent, JsonOptions);
        }
        catch { }

        // Now do the actual property search using DreamMatcher
        var dreamRequest = new DreamMatcherRequest
        {
            Query = request.Query,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            MaxResults = request.MaxResults
        };

        var matches = await MatchDreamVacationAsync(dreamRequest, ct);

        // Generate a conversational response
        var conversationalPrompt = @"Based on the search results, generate a friendly, conversational response to help the guest.
Be warm and helpful like a local expert. Mention specific properties if relevant.
Keep it concise (2-4 sentences) but informative.";

        var contextPrompt = $@"User asked: ""{request.Query}""

Found {matches.Matches.Count} matching properties.
Top matches: {string.Join(", ", matches.Matches.Take(3).Select(m => m.Property.Name))}

Generate a friendly response.";

        var conversationalResponse = await CallClaudeAsync(new ClaudeRequest
        {
            Model = _model,
            MaxTokens = 300,
            System = conversationalPrompt,
            Messages = new List<ClaudeMessage> { new() { Role = "user", Content = contextPrompt } }
        }, ct);

        return new SemanticSearchResponse
        {
            Query = request.Query,
            Intent = intent,
            Matches = matches.Matches,
            ConversationalResponse = conversationalResponse.Content,
            SearchCriteria = matches.SearchCriteria,
            TotalResults = matches.TotalPropertiesAnalyzed,
            Suggestions = intent?.FollowUpQuestions ?? new List<string>()
        };
    }

    private async Task<TripContext> BuildTripContextAsync(ItineraryRequest request, CancellationToken ct)
    {
        var context = new TripContext
        {
            PropertyName = "Your vacation rental",
            Village = "Hatteras Island",
            Amenities = new List<string>()
        };

        // In a real implementation, fetch from reservation/property data
        if (!string.IsNullOrEmpty(request.PropertyId))
        {
            var property = await _propertyService.GetPropertyBySlugAsync(request.PropertyId, null);
            if (property != null)
            {
                context.PropertyName = property.Name;
                context.Village = property.Village?.Name ?? "Hatteras Island";
                context.Amenities = property.Amenities.Select(a => a.Name).ToList();
            }
        }

        return context;
    }

    private async Task SaveItineraryAsync(Guid guestId, Guid? reservationId, ItineraryResponse itinerary, CancellationToken ct)
    {
        var tripItinerary = new TripItinerary
        {
            GuestId = guestId,
            TrackReservationId = reservationId?.ToString(),
            Name = itinerary.Title,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7),
            Status = "active",
            GeneratedBy = "ai",
            AiPrompt = JsonSerializer.Serialize(itinerary, JsonOptions),
            CreatedAt = DateTime.UtcNow
        };

        _db.TripItineraries.Add(tripItinerary);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<ExtractedSearchCriteria> ExtractSearchCriteriaAsync(string query, CancellationToken ct)
    {
        var systemPrompt = @"You are a search criteria extractor for a vacation rental platform on Hatteras Island, NC.
Extract structured search criteria from the user's natural language description.

VILLAGES (choose one if mentioned): Rodanthe, Waves, Salvo, Avon, Buxton, Frisco, Hatteras Village

COMMON AMENITIES: private pool, hot tub, ocean view, oceanfront, soundfront, pet friendly, game room, elevator, wifi, grill, deck, fireplace, washer dryer, dishwasher

Respond ONLY with a JSON object in this exact format:
{
  ""minBedrooms"": number or null,
  ""maxBedrooms"": number or null,
  ""guests"": number or null,
  ""petFriendly"": boolean or null,
  ""preferredVillage"": ""village slug"" or null,
  ""requiredAmenities"": [""amenity-slug"", ...],
  ""preferredAmenities"": [""amenity-slug"", ...],
  ""locationPreference"": ""oceanfront"" | ""soundfront"" | ""any"" | null,
  ""budgetLevel"": ""budget"" | ""moderate"" | ""luxury"" | null,
  ""vibe"": ""family"" | ""romantic"" | ""adventure"" | ""relaxation"" | ""groups"" | null,
  ""keywords"": [""important"", ""keywords"", ""from"", ""query""]
}

Village slugs: rodanthe, waves, salvo, avon, buxton, frisco, hatteras-village
Amenity slugs: private-pool, hot-tub, ocean-view, oceanfront, soundfront, pet-friendly, game-room, elevator, wifi, grill, deck, fireplace, washer-dryer, dishwasher";

        var messages = new List<ClaudeMessage>
        {
            new() { Role = "user", Content = query }
        };

        var claudeRequest = new ClaudeRequest
        {
            Model = _model,
            MaxTokens = 500,
            System = systemPrompt,
            Messages = messages
        };

        var response = await CallClaudeAsync(claudeRequest, ct);

        try
        {
            // Parse the JSON response
            var jsonStart = response.Content.IndexOf('{');
            var jsonEnd = response.Content.LastIndexOf('}') + 1;
            var jsonContent = response.Content[jsonStart..jsonEnd];

            var parsed = JsonSerializer.Deserialize<ExtractedSearchCriteriaJson>(jsonContent, JsonOptions);

            return new ExtractedSearchCriteria
            {
                MinBedrooms = parsed?.MinBedrooms,
                MaxBedrooms = parsed?.MaxBedrooms,
                Guests = parsed?.Guests,
                PetFriendly = parsed?.PetFriendly,
                PreferredVillage = parsed?.PreferredVillage,
                RequiredAmenities = parsed?.RequiredAmenities ?? new List<string>(),
                PreferredAmenities = parsed?.PreferredAmenities ?? new List<string>(),
                LocationPreference = parsed?.LocationPreference,
                BudgetLevel = parsed?.BudgetLevel,
                Vibe = parsed?.Vibe,
                Keywords = parsed?.Keywords ?? new List<string>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse search criteria, using defaults");
            return new ExtractedSearchCriteria();
        }
    }

    private async Task<List<ScoredProperty>> ScorePropertiesAsync(
        string query,
        ExtractedSearchCriteria criteria,
        List<Models.DTOs.PropertyDto> properties,
        CancellationToken ct)
    {
        var scored = new List<ScoredProperty>();

        foreach (var property in properties)
        {
            var score = CalculatePropertyScore(property, criteria);
            scored.Add(new ScoredProperty
            {
                Property = property,
                Score = score
            });
        }

        return scored.OrderByDescending(s => s.Score).ToList();
    }

    private static double CalculatePropertyScore(Models.DTOs.PropertyDto property, ExtractedSearchCriteria criteria)
    {
        double score = 50; // Base score

        // Location preference bonus
        if (!string.IsNullOrEmpty(criteria.LocationPreference))
        {
            var hasOceanfront = property.Amenities.Any(a =>
                a.Slug.Contains("oceanfront", StringComparison.OrdinalIgnoreCase));
            var hasSoundfront = property.Amenities.Any(a =>
                a.Slug.Contains("soundfront", StringComparison.OrdinalIgnoreCase));

            if (criteria.LocationPreference == "oceanfront" && hasOceanfront) score += 20;
            else if (criteria.LocationPreference == "soundfront" && hasSoundfront) score += 20;
        }

        // Required amenities (big bonus for matches)
        foreach (var amenity in criteria.RequiredAmenities)
        {
            if (property.Amenities.Any(a => a.Slug.Contains(amenity, StringComparison.OrdinalIgnoreCase)))
            {
                score += 15;
            }
            else
            {
                score -= 10; // Penalty for missing required amenity
            }
        }

        // Preferred amenities (smaller bonus)
        foreach (var amenity in criteria.PreferredAmenities)
        {
            if (property.Amenities.Any(a => a.Slug.Contains(amenity, StringComparison.OrdinalIgnoreCase)))
            {
                score += 5;
            }
        }

        // Village match bonus
        if (!string.IsNullOrEmpty(criteria.PreferredVillage) &&
            property.Village?.Slug?.Equals(criteria.PreferredVillage, StringComparison.OrdinalIgnoreCase) == true)
        {
            score += 15;
        }

        // Pet friendly match
        if (criteria.PetFriendly == true && property.PetFriendly)
        {
            score += 10;
        }
        else if (criteria.PetFriendly == true && !property.PetFriendly)
        {
            score -= 50; // Big penalty - they need pet friendly
        }

        // Size appropriateness
        if (criteria.Guests.HasValue)
        {
            if (property.Sleeps >= criteria.Guests && property.Sleeps <= criteria.Guests + 4)
            {
                score += 10; // Good fit
            }
            else if (property.Sleeps > criteria.Guests + 6)
            {
                score -= 5; // Too big
            }
        }

        // Budget level scoring based on base rate
        if (!string.IsNullOrEmpty(criteria.BudgetLevel) && property.BaseRate.HasValue)
        {
            var rate = property.BaseRate.Value;
            switch (criteria.BudgetLevel)
            {
                case "budget":
                    if (rate < 300) score += 10;
                    else if (rate > 500) score -= 10;
                    break;
                case "moderate":
                    if (rate >= 300 && rate <= 600) score += 10;
                    break;
                case "luxury":
                    if (rate > 500) score += 10;
                    else if (rate < 300) score -= 10;
                    break;
            }
        }

        // Keyword matching in description
        if (property.Description != null)
        {
            foreach (var keyword in criteria.Keywords)
            {
                if (property.Description.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                {
                    score += 3;
                }
            }
        }

        return Math.Max(0, score);
    }

    private async Task<List<DreamMatchResult>> GenerateMatchInsightsAsync(
        string originalQuery,
        List<ScoredProperty> topMatches,
        CancellationToken ct)
    {
        if (topMatches.Count == 0) return new List<DreamMatchResult>();

        // Build a prompt to generate insights for all top matches at once
        var propertySummaries = string.Join("\n", topMatches.Select((m, i) =>
            $"{i + 1}. {m.Property.Name} ({m.Property.Village?.Name ?? "Unknown"}) - {m.Property.Bedrooms}BR, sleeps {m.Property.Sleeps}, " +
            $"Amenities: {string.Join(", ", m.Property.Amenities.Take(6).Select(a => a.Name))}"));

        var systemPrompt = @"You generate brief, personalized match explanations for vacation rentals.
For each property, write 1-2 sentences explaining why it matches the guest's dream vacation.
Be specific about features that match their needs. Be warm and enthusiastic.

Respond with a JSON array of strings, one explanation per property, in order:
[""explanation for property 1"", ""explanation for property 2"", ...]";

        var userPrompt = $@"Guest's dream vacation: ""{originalQuery}""

Top matching properties:
{propertySummaries}

Generate a brief, personalized match explanation for each property.";

        var messages = new List<ClaudeMessage>
        {
            new() { Role = "user", Content = userPrompt }
        };

        var claudeRequest = new ClaudeRequest
        {
            Model = _model,
            MaxTokens = 1000,
            System = systemPrompt,
            Messages = messages
        };

        try
        {
            var response = await CallClaudeAsync(claudeRequest, ct);

            var jsonStart = response.Content.IndexOf('[');
            var jsonEnd = response.Content.LastIndexOf(']') + 1;
            var jsonContent = response.Content[jsonStart..jsonEnd];

            var explanations = JsonSerializer.Deserialize<List<string>>(jsonContent, JsonOptions) ?? new List<string>();

            return topMatches.Select((m, i) => new DreamMatchResult
            {
                Property = m.Property,
                MatchScore = (int)Math.Round(m.Score),
                MatchExplanation = i < explanations.Count ? explanations[i] : "A great match for your vacation!",
                HighlightedFeatures = GetHighlightedFeatures(m.Property)
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate match insights, using defaults");

            return topMatches.Select(m => new DreamMatchResult
            {
                Property = m.Property,
                MatchScore = (int)Math.Round(m.Score),
                MatchExplanation = $"A wonderful {m.Property.Bedrooms}-bedroom property in {m.Property.Village?.Name ?? "Hatteras Island"}!",
                HighlightedFeatures = GetHighlightedFeatures(m.Property)
            }).ToList();
        }
    }

    private static List<string> GetHighlightedFeatures(Models.DTOs.PropertyDto property)
    {
        var features = new List<string>();

        if (property.Amenities.Any(a => a.Slug.Contains("oceanfront")))
            features.Add("Oceanfront");
        if (property.Amenities.Any(a => a.Slug.Contains("pool")))
            features.Add("Private Pool");
        if (property.Amenities.Any(a => a.Slug.Contains("hot-tub")))
            features.Add("Hot Tub");
        if (property.PetFriendly)
            features.Add("Pet Friendly");
        if (property.Amenities.Any(a => a.Slug.Contains("game-room")))
            features.Add("Game Room");
        if (property.Amenities.Any(a => a.Slug.Contains("elevator")))
            features.Add("Elevator");

        return features.Take(4).ToList();
    }

    private static string GenerateSearchSummary(ExtractedSearchCriteria criteria, int matchCount, int totalAnalyzed)
    {
        var parts = new List<string>();

        if (!string.IsNullOrEmpty(criteria.PreferredVillage))
            parts.Add($"in {criteria.PreferredVillage}");
        if (criteria.MinBedrooms.HasValue)
            parts.Add($"{criteria.MinBedrooms}+ bedrooms");
        if (criteria.PetFriendly == true)
            parts.Add("pet-friendly");
        if (!string.IsNullOrEmpty(criteria.LocationPreference))
            parts.Add(criteria.LocationPreference);

        var criteriaStr = parts.Count > 0 ? string.Join(", ", parts) : "your preferences";

        return $"Found {matchCount} perfect matches from {totalAnalyzed} properties analyzed based on {criteriaStr}.";
    }

    private async Task<Conversation> GetOrCreateConversationAsync(ChatRequest request, CancellationToken ct)
    {
        Conversation? conversation = null;

        if (request.ConversationId.HasValue)
        {
            conversation = await _db.Conversations.FindAsync(new object[] { request.ConversationId.Value }, ct);
        }

        if (conversation == null)
        {
            conversation = new Conversation
            {
                GuestId = request.GuestId,
                SessionId = request.SessionId,
                Title = "New Conversation",
                Status = "active",
                Context = request.Context != null ? JsonSerializer.Serialize(request.Context) : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Conversations.Add(conversation);
            await _db.SaveChangesAsync(ct);
        }

        return conversation;
    }

    private async Task<ConversationContext> BuildContextAsync(ChatRequest request, CancellationToken ct)
    {
        var context = new ConversationContext();

        // Add property context if provided
        if (!string.IsNullOrEmpty(request.Context?.PropertyId))
        {
            var property = await _propertyService.GetPropertyBySlugAsync(request.Context.PropertyId, null);
            if (property != null)
            {
                context.CurrentProperty = new PropertyContext
                {
                    Name = property.Name,
                    Village = property.Village?.Name,
                    Bedrooms = property.Bedrooms,
                    Sleeps = property.Sleeps,
                    Amenities = property.Amenities.Select(a => a.Name).ToList()
                };
            }
        }

        // Add reservation context if guest has upcoming trips
        if (request.GuestId.HasValue)
        {
            // Could fetch upcoming reservations here
        }

        return context;
    }

    private async Task<ClaudeResponse> CallClaudeAsync(ClaudeRequest request, CancellationToken ct)
    {
        var requestJson = JsonSerializer.Serialize(request, JsonOptions);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
        _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

        var response = await _httpClient.PostAsync("v1/messages", content, ct);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("Claude API error: {Error}", error);
            throw new Exception($"Claude API error: {response.StatusCode}");
        }

        var responseJson = await response.Content.ReadAsStringAsync(ct);
        var claudeResponse = JsonSerializer.Deserialize<ClaudeApiResponse>(responseJson, JsonOptions);

        return new ClaudeResponse
        {
            Content = claudeResponse?.Content?.FirstOrDefault()?.Text ?? "",
            InputTokens = claudeResponse?.Usage?.InputTokens ?? 0,
            OutputTokens = claudeResponse?.Usage?.OutputTokens ?? 0
        };
    }

    private static string GetSystemPrompt(ConversationContext context)
    {
        var prompt = @"You are Sandy, the friendly AI concierge for Surf or Sound Realty on Hatteras Island, North Carolina.

ABOUT YOU:
- You're warm, helpful, and knowledgeable about Hatteras Island
- You help guests find the perfect vacation rental and answer questions about the island
- You're enthusiastic about the local area - the beaches, lighthouses, fishing, and unique character of each village

THE SEVEN VILLAGES (North to South):
1. Rodanthe - Known for the Chicamacomico Lifesaving Station and the iconic ""Nights in Rodanthe"" house
2. Waves - Small, quiet community perfect for those seeking solitude
3. Salvo - Family-friendly with great beach access
4. Avon - Largest village with shops, restaurants, and the Avon Fishing Pier
5. Buxton - Home to the famous Cape Hatteras Lighthouse, great for surfing
6. Frisco - Known for Frisco Native American Museum, quieter atmosphere
7. Hatteras Village - The southernmost village, gateway to Ocracoke ferry

PROPERTY FEATURES TO KNOW:
- Oceanfront vs Soundfront vs Semi-oceanfront
- Private pools vs community pools
- Pet-friendly properties (we have many!)
- Hot tubs, game rooms, elevators
- Walk to beach distances

YOUR GUIDELINES:
- Be conversational and warm, not robotic
- Give specific recommendations when you can
- Ask clarifying questions to better help guests
- If you don't know something specific, say so
- Keep responses concise but helpful (aim for 2-4 sentences unless more detail is needed)
- Always be enthusiastic about Hatteras Island!";

        if (context.CurrentProperty != null)
        {
            prompt += $@"

CURRENT CONTEXT:
The guest is looking at ""{context.CurrentProperty.Name}"" in {context.CurrentProperty.Village}.
- {context.CurrentProperty.Bedrooms} bedrooms, sleeps {context.CurrentProperty.Sleeps}
- Amenities: {string.Join(", ", context.CurrentProperty.Amenities.Take(5))}";
        }

        return prompt;
    }

    private static string GenerateTitle(string firstMessage)
    {
        // Generate a short title from the first message
        var words = firstMessage.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var title = string.Join(" ", words.Take(5));
        if (words.Length > 5) title += "...";
        return title.Length > 50 ? title[..47] + "..." : title;
    }

    private static List<string>? ExtractSuggestedActions(string response)
    {
        // Could use AI to extract suggested actions, for now return null
        return null;
    }
}

// Request/Response models
public class ChatRequest
{
    public Guid? ConversationId { get; set; }
    public Guid? GuestId { get; set; }
    public string? SessionId { get; set; }
    public string Message { get; set; } = "";
    public ChatContext? Context { get; set; }
}

public class ChatContext
{
    public string? PropertyId { get; set; }
    public string? ReservationId { get; set; }
    public string? Page { get; set; }
}

public class ChatResponse
{
    public Guid ConversationId { get; set; }
    public string Message { get; set; } = "";
    public List<string>? SuggestedActions { get; set; }
}

public class ConversationSummary
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTime LastMessageAt { get; set; }
    public int MessageCount { get; set; }
}

public class ConversationDetail
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Status { get; set; } = "";
    public List<MessageDto> Messages { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class MessageDto
{
    public Guid Id { get; set; }
    public string Role { get; set; } = "";
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

// Internal models
internal class ConversationContext
{
    public PropertyContext? CurrentProperty { get; set; }
}

internal class PropertyContext
{
    public string Name { get; set; } = "";
    public string? Village { get; set; }
    public int Bedrooms { get; set; }
    public int Sleeps { get; set; }
    public List<string> Amenities { get; set; } = new();
}

// Claude API models
internal class ClaudeRequest
{
    public string Model { get; set; } = "";
    [JsonPropertyName("max_tokens")]
    public int MaxTokens { get; set; }
    public string System { get; set; } = "";
    public List<ClaudeMessage> Messages { get; set; } = new();
}

internal class ClaudeMessage
{
    public string Role { get; set; } = "";
    public string Content { get; set; } = "";
}

internal class ClaudeApiResponse
{
    public List<ClaudeContentBlock>? Content { get; set; }
    public ClaudeUsage? Usage { get; set; }
}

internal class ClaudeContentBlock
{
    public string Type { get; set; } = "";
    public string Text { get; set; } = "";
}

internal class ClaudeUsage
{
    [JsonPropertyName("input_tokens")]
    public int InputTokens { get; set; }
    [JsonPropertyName("output_tokens")]
    public int OutputTokens { get; set; }
}

internal class ClaudeResponse
{
    public string Content { get; set; } = "";
    public int InputTokens { get; set; }
    public int OutputTokens { get; set; }
}

// Dream Matcher models
public class DreamMatcherRequest
{
    public string Query { get; set; } = "";
    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }
    public int MaxResults { get; set; } = 6;
}

public class DreamMatcherResponse
{
    public List<DreamMatchResult> Matches { get; set; } = new();
    public ExtractedSearchCriteria SearchCriteria { get; set; } = new();
    public int TotalPropertiesAnalyzed { get; set; }
    public string Summary { get; set; } = "";
}

public class DreamMatchResult
{
    public Models.DTOs.PropertyDto Property { get; set; } = null!;
    public int MatchScore { get; set; }
    public string MatchExplanation { get; set; } = "";
    public List<string> HighlightedFeatures { get; set; } = new();
}

public class ExtractedSearchCriteria
{
    public int? MinBedrooms { get; set; }
    public int? MaxBedrooms { get; set; }
    public int? Guests { get; set; }
    public bool? PetFriendly { get; set; }
    public string? PreferredVillage { get; set; }
    public List<string> RequiredAmenities { get; set; } = new();
    public List<string> PreferredAmenities { get; set; } = new();
    public string? LocationPreference { get; set; }
    public string? BudgetLevel { get; set; }
    public string? Vibe { get; set; }
    public List<string> Keywords { get; set; } = new();
}

internal class ExtractedSearchCriteriaJson
{
    public int? MinBedrooms { get; set; }
    public int? MaxBedrooms { get; set; }
    public int? Guests { get; set; }
    public bool? PetFriendly { get; set; }
    public string? PreferredVillage { get; set; }
    public List<string>? RequiredAmenities { get; set; }
    public List<string>? PreferredAmenities { get; set; }
    public string? LocationPreference { get; set; }
    public string? BudgetLevel { get; set; }
    public string? Vibe { get; set; }
    public List<string>? Keywords { get; set; }
}

internal class ScoredProperty
{
    public Models.DTOs.PropertyDto Property { get; set; } = null!;
    public double Score { get; set; }
}

internal class TripContext
{
    public string PropertyName { get; set; } = "";
    public string Village { get; set; } = "";
    public List<string> Amenities { get; set; } = new();
}

// Itinerary Models
public class ItineraryRequest
{
    public Guid? ReservationId { get; set; }
    public Guid? GuestId { get; set; }
    public string? PropertyId { get; set; }
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public int NumberOfDays => (CheckOut - CheckIn).Days;
    public int PartySize { get; set; } = 2;
    public List<string>? Interests { get; set; }
    public string? SpecialRequests { get; set; }
}

public class ItineraryResponse
{
    public Guid? ReservationId { get; set; }
    public string Title { get; set; } = "";
    public string Overview { get; set; } = "";
    public List<ItineraryDay> Days { get; set; } = new();
    public List<string> PackingList { get; set; } = new();
    public List<DiningRecommendation> DiningRecommendations { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
}

public class ItineraryDay
{
    public int DayNumber { get; set; }
    public string? Date { get; set; }
    public string Theme { get; set; } = "";
    public List<ItineraryActivity> Activities { get; set; } = new();
}

public class ItineraryActivity
{
    public string TimeSlot { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string? Location { get; set; }
    public string? Duration { get; set; }
    public string Type { get; set; } = "";
    public string? Tip { get; set; }
}

public class DiningRecommendation
{
    public string Name { get; set; } = "";
    public string Cuisine { get; set; } = "";
    public string PriceRange { get; set; } = "";
    public string BestFor { get; set; } = "";
    public string Village { get; set; } = "";
}

// Recommendations Models
public class RecommendationsRequest
{
    public string Type { get; set; } = ""; // restaurants, activities, beaches, shopping, attractions
    public string? Village { get; set; }
    public string? PartyComposition { get; set; }
    public List<string>? Interests { get; set; }
    public string? BudgetLevel { get; set; }
    public string? SpecificNeeds { get; set; }
    public int MaxResults { get; set; } = 5;
}

public class RecommendationsResponse
{
    public string Category { get; set; } = "";
    public string? Village { get; set; }
    public List<Recommendation> Recommendations { get; set; } = new();
    public string LocalTip { get; set; } = "";
    public DateTime GeneratedAt { get; set; }
}

public class Recommendation
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Type { get; set; } = "";
    public string Village { get; set; } = "";
    public string? Address { get; set; }
    public string? PriceRange { get; set; }
    public string? BestTime { get; set; }
    public string? InsiderTip { get; set; }
    public string? WebsiteUrl { get; set; }
    public List<string> Tags { get; set; } = new();
}

// Trip Insights Models
public class TripInsightsResponse
{
    public Guid ReservationId { get; set; }
    public WeatherOutlook? WeatherOutlook { get; set; }
    public List<PackingItem> PackingEssentials { get; set; } = new();
    public List<string> ArrivalTips { get; set; } = new();
    public List<LocalInsight> LocalInsights { get; set; } = new();
    public EmergencyInfo? EmergencyInfo { get; set; }
    public List<MustDo> MustDos { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
}

public class WeatherOutlook
{
    public string Summary { get; set; } = "";
    public int? AvgHigh { get; set; }
    public int? AvgLow { get; set; }
    public string Conditions { get; set; } = "";
    public List<string> Recommendations { get; set; } = new();
}

public class PackingItem
{
    public string Item { get; set; } = "";
    public string Reason { get; set; } = "";
    public string Priority { get; set; } = "";
}

public class LocalInsight
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "";
}

public class EmergencyInfo
{
    public string NearestHospital { get; set; } = "";
    public string UrgentCare { get; set; } = "";
    public string Police { get; set; } = "";
    public string CoastGuard { get; set; } = "";
}

public class MustDo
{
    public string Activity { get; set; } = "";
    public string Reason { get; set; } = "";
}

// Semantic Search Models
public class SemanticSearchRequest
{
    public string Query { get; set; } = "";
    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }
    public int MaxResults { get; set; } = 6;
    public Guid? GuestId { get; set; }
    public string? SessionId { get; set; }
}

public class SemanticSearchResponse
{
    public string Query { get; set; } = "";
    public SearchIntent? Intent { get; set; }
    public List<DreamMatchResult> Matches { get; set; } = new();
    public string ConversationalResponse { get; set; } = "";
    public ExtractedSearchCriteria SearchCriteria { get; set; } = new();
    public int TotalResults { get; set; }
    public List<string> Suggestions { get; set; } = new();
}

public class SearchIntent
{
    public string Intent { get; set; } = "";
    public string Sentiment { get; set; } = "";
    public SearchExtractedParams? ExtractedParams { get; set; }
    public List<string> FollowUpQuestions { get; set; } = new();
    public string SearchStrategy { get; set; } = "";
}

public class SearchExtractedParams
{
    public SearchDates? Dates { get; set; }
    public int? Guests { get; set; }
    public BedroomRange? Bedrooms { get; set; }
    public string? Location { get; set; }
    public List<string>? Amenities { get; set; }
    public string? Budget { get; set; }
    public string? TripType { get; set; }
}

public class SearchDates
{
    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }
}

public class BedroomRange
{
    public int? Min { get; set; }
    public int? Max { get; set; }
}
