namespace SurfOrSound.API.Models.Entities;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? GuestId { get; set; }
    public string? SessionId { get; set; } // For anonymous users
    public string Title { get; set; } = "New Conversation";
    public string Status { get; set; } = "active"; // active, archived, resolved
    public string? Context { get; set; } // JSON: current property, reservation, etc.
    public string? Intent { get; set; } // booking, inquiry, support, local_tips, etc.
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }

    public List<ConversationMessage> Messages { get; set; } = new();
}

public class ConversationMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public string Role { get; set; } = "user"; // user, assistant, system
    public string Content { get; set; } = "";
    public string? Metadata { get; set; } // JSON: tokens used, model, latency, etc.
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Conversation? Conversation { get; set; }
}

public class ConversationFeedback
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MessageId { get; set; }
    public int Rating { get; set; } // 1-5 or thumbs up/down (1 or -1)
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
