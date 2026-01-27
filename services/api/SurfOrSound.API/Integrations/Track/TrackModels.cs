namespace SurfOrSound.API.Integrations.Track;

public record TrackApiResponse<T>(
    T? Data,
    bool Success,
    string? Error
);

public record TrackProperty(
    string Id,
    string Name,
    string? Description,
    string? Village,
    int Bedrooms,
    decimal Bathrooms,
    int Sleeps,
    string PropertyType,
    List<string> Amenities,
    TrackAddress Address,
    bool IsActive,
    decimal? BaseRate
);

public record TrackAddress(
    string? Street,
    string? City,
    string? State,
    string? Zip,
    decimal? Lat,
    decimal? Lng
);

public record TrackAvailability(
    string PropertyId,
    List<TrackAvailabilityDate> Dates
);

public record TrackAvailabilityDate(
    DateTime Date,
    bool IsAvailable,
    decimal? Rate,
    int MinimumStay
);

public record TrackRateInfo(
    string PropertyId,
    DateTime StartDate,
    DateTime EndDate,
    decimal BaseRate,
    decimal TotalRate,
    int Nights,
    List<TrackFee> Fees,
    List<TrackTax> Taxes,
    decimal GrandTotal
);

public record TrackFee(
    string Name,
    decimal Amount,
    string Type
);

public record TrackTax(
    string Name,
    decimal Rate,
    decimal Amount
);

public record TrackReservation(
    string Id,
    string PropertyId,
    string GuestId,
    DateTime CheckIn,
    DateTime CheckOut,
    int Adults,
    int Children,
    int? Pets,
    decimal TotalAmount,
    string Status,
    TrackPaymentInfo? Payment,
    TrackGuestInfo? Guest,
    DateTime CreatedAt
);

public record TrackPaymentInfo(
    string? TransactionId,
    decimal AmountPaid,
    decimal AmountDue,
    string Status,
    DateTime? PaidAt
);

public record TrackGuestInfo(
    string Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone
);

public record TrackGuest(
    string Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    TrackAddress? Address,
    DateTime CreatedAt
);

public record CreateTrackReservationRequest(
    string PropertyId,
    string CheckIn,
    string CheckOut,
    int Adults,
    int Children,
    int Pets,
    CreateTrackGuestRequest Guest,
    CreateTrackPaymentRequest? Payment
);

public record CreateTrackGuestRequest(
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    CreateTrackAddressRequest? Address
);

public record CreateTrackAddressRequest(
    string? Street,
    string? City,
    string? State,
    string? Zip
);

public record CreateTrackPaymentRequest(
    string Token,
    decimal Amount,
    string Type,
    CreateTrackBillingRequest? Billing
);

public record CreateTrackBillingRequest(
    string FirstName,
    string LastName,
    string Address,
    string City,
    string State,
    string Zip
);
