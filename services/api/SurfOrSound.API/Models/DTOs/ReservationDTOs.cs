namespace SurfOrSound.API.Models.DTOs;

public record ReservationDto
{
    public string Id { get; init; } = "";
    public string PropertyId { get; init; } = "";
    public PropertyDto? Property { get; init; }
    public string CheckIn { get; init; } = "";
    public string CheckOut { get; init; } = "";
    public int Adults { get; init; }
    public int Children { get; init; }
    public int Pets { get; init; }
    public decimal TotalAmount { get; init; }
    public string Status { get; init; } = "";
    public string PaymentStatus { get; init; } = "";
    public DateTime CreatedAt { get; init; }
}

public record ReservationDetailDto : ReservationDto
{
    public GuestInfoDto? Guest { get; init; }
    public PaymentInfoDto? Payment { get; init; }
}

public record GuestInfoDto
{
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string Email { get; init; } = "";
    public string? Phone { get; init; }
    public AddressDto? Address { get; init; }
}

public record PaymentInfoDto
{
    public string? TransactionId { get; init; }
    public decimal AmountPaid { get; init; }
    public decimal AmountDue { get; init; }
    public string Status { get; init; } = "";
}

public record CreateReservationRequest
{
    public string PropertyId { get; init; } = "";
    public string CheckIn { get; init; } = "";
    public string CheckOut { get; init; } = "";
    public int Adults { get; init; }
    public int Children { get; init; }
    public int Pets { get; init; }
    public GuestInfoRequest Guest { get; init; } = new();
    public PaymentRequest Payment { get; init; } = new();
}

public record GuestInfoRequest
{
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string Email { get; init; } = "";
    public string? Phone { get; init; }
    public AddressRequest? Address { get; init; }
}

public record AddressRequest
{
    public string? Street { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? Zip { get; init; }
}

public record PaymentRequest
{
    public string Token { get; init; } = "";
    public decimal Amount { get; init; }
    public string Type { get; init; } = "full"; // full, deposit
    public BillingRequest? Billing { get; init; }
}

public record BillingRequest
{
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string Address { get; init; } = "";
    public string City { get; init; } = "";
    public string State { get; init; } = "";
    public string Zip { get; init; } = "";
}
