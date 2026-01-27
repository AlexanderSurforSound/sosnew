using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurfOrSound.API.Services;

namespace SurfOrSound.API.Controllers;

[ApiController]
[Route("api/v1/chat")]
public class ChatController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IAIService aiService, ILogger<ChatController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }

    /// <summary>
    /// Send a message to Sandy, the AI concierge
    /// </summary>
    /// <remarks>
    /// This endpoint can be used by both authenticated users and anonymous visitors.
    /// For anonymous visitors, provide a sessionId to maintain conversation continuity.
    /// </remarks>
    [HttpPost("message")]
    [AllowAnonymous]
    public async Task<ActionResult<ChatResponse>> SendMessage([FromBody] SendMessageRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Message cannot be empty" });
        }

        if (request.Message.Length > 2000)
        {
            return BadRequest(new { message = "Message is too long (max 2000 characters)" });
        }

        try
        {
            var guestId = GetUserId();

            // For anonymous users, require a sessionId
            if (!guestId.HasValue && string.IsNullOrEmpty(request.SessionId))
            {
                return BadRequest(new { message = "SessionId is required for anonymous users" });
            }

            var chatRequest = new ChatRequest
            {
                ConversationId = request.ConversationId,
                GuestId = guestId,
                SessionId = request.SessionId,
                Message = request.Message,
                Context = request.Context != null ? new ChatContext
                {
                    PropertyId = request.Context.PropertyId,
                    ReservationId = request.Context.ReservationId,
                    Page = request.Context.Page
                } : null
            };

            var response = await _aiService.ChatAsync(chatRequest, ct);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message");
            return StatusCode(500, new { message = "Sorry, I'm having trouble responding right now. Please try again." });
        }
    }

    /// <summary>
    /// Get conversation history for the current user
    /// </summary>
    [HttpGet("conversations")]
    public async Task<ActionResult<List<ConversationSummary>>> GetConversations(
        [FromQuery] string? sessionId,
        CancellationToken ct)
    {
        var guestId = GetUserId();

        if (!guestId.HasValue && string.IsNullOrEmpty(sessionId))
        {
            return Ok(new List<ConversationSummary>());
        }

        var conversations = await _aiService.GetConversationsAsync(guestId, sessionId, ct);
        return Ok(conversations);
    }

    /// <summary>
    /// Get a specific conversation with all messages
    /// </summary>
    [HttpGet("conversations/{conversationId:guid}")]
    public async Task<ActionResult<ConversationDetail>> GetConversation(Guid conversationId, CancellationToken ct)
    {
        var conversation = await _aiService.GetConversationAsync(conversationId, ct);

        if (conversation == null)
        {
            return NotFound(new { message = "Conversation not found" });
        }

        // TODO: Verify ownership of conversation

        return Ok(conversation);
    }

    /// <summary>
    /// Delete a conversation
    /// </summary>
    [HttpDelete("conversations/{conversationId:guid}")]
    [Authorize]
    public async Task<ActionResult> DeleteConversation(Guid conversationId, CancellationToken ct)
    {
        var conversation = await _aiService.GetConversationAsync(conversationId, ct);

        if (conversation == null)
        {
            return NotFound(new { message = "Conversation not found" });
        }

        // TODO: Verify ownership

        await _aiService.DeleteConversationAsync(conversationId, ct);
        return NoContent();
    }

    /// <summary>
    /// Submit feedback for a message
    /// </summary>
    [HttpPost("feedback")]
    public async Task<ActionResult> SubmitFeedback([FromBody] FeedbackRequest request, CancellationToken ct)
    {
        // TODO: Implement feedback storage
        _logger.LogInformation(
            "Received feedback for message {MessageId}: Rating {Rating}",
            request.MessageId, request.Rating);

        return Ok(new { message = "Thank you for your feedback!" });
    }
}

// Request DTOs
public class SendMessageRequest
{
    public Guid? ConversationId { get; set; }
    public string? SessionId { get; set; }
    public string Message { get; set; } = "";
    public MessageContext? Context { get; set; }
}

public class MessageContext
{
    public string? PropertyId { get; set; }
    public string? ReservationId { get; set; }
    public string? Page { get; set; }
}

public class FeedbackRequest
{
    public Guid MessageId { get; set; }
    public int Rating { get; set; } // 1 = thumbs down, 5 = thumbs up
    public string? Comment { get; set; }
}
