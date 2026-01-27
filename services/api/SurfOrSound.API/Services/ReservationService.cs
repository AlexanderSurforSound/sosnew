using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Data;
using SurfOrSound.API.Integrations.Track;
using SurfOrSound.API.Models.DTOs;

namespace SurfOrSound.API.Services;

public interface IReservationService
{
    Task<ReservationDto> CreateReservationAsync(CreateReservationRequest request, Guid userId);
    Task<List<ReservationDto>> GetUserReservationsAsync(Guid userId);
    Task<ReservationDetailDto?> GetReservationAsync(string reservationId, Guid userId);
}

public class ReservationService : IReservationService
{
    private readonly ITrackClient _trackClient;
    private readonly ITrackPaymentsClient _paymentsClient;
    private readonly IPropertyService _propertyService;
    private readonly AppDbContext _db;
    private readonly ILogger<ReservationService> _logger;

    public ReservationService(
        ITrackClient trackClient,
        ITrackPaymentsClient paymentsClient,
        IPropertyService propertyService,
        AppDbContext db,
        ILogger<ReservationService> logger)
    {
        _trackClient = trackClient;
        _paymentsClient = paymentsClient;
        _propertyService = propertyService;
        _db = db;
        _logger = logger;
    }

    public async Task<ReservationDto> CreateReservationAsync(CreateReservationRequest request, Guid userId)
    {
        // Get guest from database
        var guest = await _db.Guests.FindAsync(userId);
        if (guest == null)
            throw new UnauthorizedAccessException("User not found");

        // Find or create Track guest
        var trackGuest = await _trackClient.FindGuestByEmailAsync(request.Guest.Email);
        if (trackGuest == null)
        {
            trackGuest = await _trackClient.CreateGuestAsync(new CreateTrackGuestRequest(
                request.Guest.Email,
                request.Guest.FirstName,
                request.Guest.LastName,
                request.Guest.Phone,
                request.Guest.Address != null ? new CreateTrackAddressRequest(
                    request.Guest.Address.Street,
                    request.Guest.Address.City,
                    request.Guest.Address.State,
                    request.Guest.Address.Zip
                ) : null
            ));
        }

        // Update local guest with Track ID if not set
        if (string.IsNullOrEmpty(guest.TrackGuestId))
        {
            guest.TrackGuestId = trackGuest.Id;
            await _db.SaveChangesAsync();
        }

        // Create reservation in Track
        var trackReservation = await _trackClient.CreateReservationAsync(new CreateTrackReservationRequest(
            request.PropertyId,
            request.CheckIn,
            request.CheckOut,
            request.Adults,
            request.Children,
            request.Pets,
            new CreateTrackGuestRequest(
                request.Guest.Email,
                request.Guest.FirstName,
                request.Guest.LastName,
                request.Guest.Phone,
                null
            ),
            request.Payment != null ? new CreateTrackPaymentRequest(
                request.Payment.Token,
                request.Payment.Amount,
                request.Payment.Type,
                request.Payment.Billing != null ? new CreateTrackBillingRequest(
                    request.Payment.Billing.FirstName,
                    request.Payment.Billing.LastName,
                    request.Payment.Billing.Address,
                    request.Payment.Billing.City,
                    request.Payment.Billing.State,
                    request.Payment.Billing.Zip
                ) : null
            ) : null
        ));

        // Get property details for response
        var property = await _propertyService.GetPropertyBySlugAsync(request.PropertyId, userId);

        return new ReservationDto
        {
            Id = trackReservation.Id,
            PropertyId = trackReservation.PropertyId,
            Property = property != null ? new PropertyDto
            {
                Id = property.Id,
                TrackId = property.TrackId,
                Name = property.Name,
                Slug = property.Slug,
                Images = property.Images,
                Village = property.Village,
                Bedrooms = property.Bedrooms,
                Bathrooms = property.Bathrooms,
                Sleeps = property.Sleeps,
                PropertyType = property.PropertyType,
                Amenities = property.Amenities,
                PetFriendly = property.PetFriendly,
                Featured = property.Featured,
                BaseRate = property.BaseRate
            } : null,
            CheckIn = trackReservation.CheckIn.ToString("yyyy-MM-dd"),
            CheckOut = trackReservation.CheckOut.ToString("yyyy-MM-dd"),
            Adults = trackReservation.Adults,
            Children = trackReservation.Children,
            Pets = trackReservation.Pets ?? 0,
            TotalAmount = trackReservation.TotalAmount,
            Status = trackReservation.Status,
            PaymentStatus = trackReservation.Payment?.Status ?? "pending",
            CreatedAt = trackReservation.CreatedAt
        };
    }

    public async Task<List<ReservationDto>> GetUserReservationsAsync(Guid userId)
    {
        var guest = await _db.Guests.FindAsync(userId);
        if (guest == null || string.IsNullOrEmpty(guest.TrackGuestId))
            return new List<ReservationDto>();

        var reservations = await _trackClient.GetReservationsAsync(guestId: guest.TrackGuestId);

        return reservations.Select(r => new ReservationDto
        {
            Id = r.Id,
            PropertyId = r.PropertyId,
            CheckIn = r.CheckIn.ToString("yyyy-MM-dd"),
            CheckOut = r.CheckOut.ToString("yyyy-MM-dd"),
            Adults = r.Adults,
            Children = r.Children,
            Pets = r.Pets ?? 0,
            TotalAmount = r.TotalAmount,
            Status = r.Status,
            PaymentStatus = r.Payment?.Status ?? "pending",
            CreatedAt = r.CreatedAt
        }).ToList();
    }

    public async Task<ReservationDetailDto?> GetReservationAsync(string reservationId, Guid userId)
    {
        var guest = await _db.Guests.FindAsync(userId);
        if (guest == null)
            return null;

        var reservation = await _trackClient.GetReservationAsync(reservationId);
        if (reservation == null)
            return null;

        // Verify the reservation belongs to this user
        if (guest.TrackGuestId != reservation.GuestId)
            return null;

        return new ReservationDetailDto
        {
            Id = reservation.Id,
            PropertyId = reservation.PropertyId,
            CheckIn = reservation.CheckIn.ToString("yyyy-MM-dd"),
            CheckOut = reservation.CheckOut.ToString("yyyy-MM-dd"),
            Adults = reservation.Adults,
            Children = reservation.Children,
            Pets = reservation.Pets ?? 0,
            TotalAmount = reservation.TotalAmount,
            Status = reservation.Status,
            PaymentStatus = reservation.Payment?.Status ?? "pending",
            CreatedAt = reservation.CreatedAt,
            Guest = reservation.Guest != null ? new GuestInfoDto
            {
                FirstName = reservation.Guest.FirstName ?? "",
                LastName = reservation.Guest.LastName ?? "",
                Email = reservation.Guest.Email,
                Phone = reservation.Guest.Phone
            } : null,
            Payment = reservation.Payment != null ? new PaymentInfoDto
            {
                TransactionId = reservation.Payment.TransactionId,
                AmountPaid = reservation.Payment.AmountPaid,
                AmountDue = reservation.Payment.AmountDue,
                Status = reservation.Payment.Status
            } : null
        };
    }
}
