using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace SurfOrSound.API.Hubs;

public interface INotificationClient
{
    Task ReceiveNotification(NotificationMessage notification);
    Task ReceiveAchievement(AchievementUnlockedMessage achievement);
    Task ReceiveLoyaltyUpdate(LoyaltyUpdateMessage update);
    Task ReceiveDeviceStatus(DeviceStatusMessage status);
    Task ReceiveReservationUpdate(ReservationUpdateMessage update);
    Task ReceiveMessage(ChatMessage message);
}

[Authorize]
public class NotificationHub : Hub<INotificationClient>
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            // Add user to their personal group for targeted notifications
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
            _logger.LogInformation("User {UserId} connected to NotificationHub", userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user:{userId}");
            _logger.LogInformation("User {UserId} disconnected from NotificationHub", userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Subscribe to reservation updates
    public async Task SubscribeToReservation(string reservationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"reservation:{reservationId}");
        _logger.LogDebug("Connection {ConnectionId} subscribed to reservation {ReservationId}",
            Context.ConnectionId, reservationId);
    }

    public async Task UnsubscribeFromReservation(string reservationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"reservation:{reservationId}");
    }

    // Subscribe to property updates (for owners)
    public async Task SubscribeToProperty(string propertyId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"property:{propertyId}");
    }

    public async Task UnsubscribeFromProperty(string propertyId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"property:{propertyId}");
    }

    // Mark notification as read
    public async Task MarkNotificationRead(string notificationId)
    {
        // Handled by the notification service
        _logger.LogDebug("Notification {NotificationId} marked as read by connection {ConnectionId}",
            notificationId, Context.ConnectionId);
    }
}

// Message types
public record NotificationMessage(
    string Id,
    string Type,
    string Title,
    string Body,
    string? ImageUrl,
    string? ActionUrl,
    DateTime CreatedAt
);

public record AchievementUnlockedMessage(
    string AchievementId,
    string Code,
    string Name,
    string Description,
    string BadgeImageUrl,
    int PointsAwarded,
    DateTime UnlockedAt
);

public record LoyaltyUpdateMessage(
    int CurrentPoints,
    int PointsChange,
    string CurrentTier,
    string? NewTier,
    int PointsToNextTier
);

public record DeviceStatusMessage(
    string DeviceId,
    string PropertyId,
    string DeviceType,
    string Status,
    double? Temperature,
    string? BatteryLevel,
    DateTime UpdatedAt
);

public record ReservationUpdateMessage(
    string ReservationId,
    string PropertyId,
    string Status,
    string? Message,
    DateTime UpdatedAt
);

public record ChatMessage(
    string ConversationId,
    string MessageId,
    string Role,
    string Content,
    DateTime CreatedAt
);
