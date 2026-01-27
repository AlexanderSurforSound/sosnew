using System.Net.Http.Json;

namespace SurfOrSound.API.Integrations.Track;

public interface ITrackPaymentsClient
{
    Task<PaymentResult> ProcessPaymentAsync(ProcessPaymentRequest request);
    Task<PaymentResult> ProcessDepositAsync(string reservationId, decimal amount, PaymentMethod method);
    Task<PaymentResult> ProcessBalanceAsync(string reservationId, PaymentMethod method);
    Task<RefundResult> ProcessRefundAsync(string reservationId, decimal amount, string reason);
    Task<PaymentStatus> GetPaymentStatusAsync(string reservationId);
}

public class TrackPaymentsClient : ITrackPaymentsClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TrackPaymentsClient> _logger;

    public TrackPaymentsClient(HttpClient httpClient, ILogger<TrackPaymentsClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<PaymentResult> ProcessPaymentAsync(ProcessPaymentRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/payments/process", new
            {
                reservation_id = request.ReservationId,
                amount = request.Amount,
                payment_method = new
                {
                    type = request.PaymentMethod.Type,
                    token = request.PaymentMethod.Token
                },
                payment_type = request.PaymentType,
                billing_address = request.BillingAddress != null ? new
                {
                    first_name = request.BillingAddress.FirstName,
                    last_name = request.BillingAddress.LastName,
                    address = request.BillingAddress.Address,
                    city = request.BillingAddress.City,
                    state = request.BillingAddress.State,
                    zip = request.BillingAddress.Zip
                } : null
            });

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<PaymentResult>();
            return result ?? throw new Exception("Payment processing failed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process payment for reservation {ReservationId}", request.ReservationId);
            throw;
        }
    }

    public async Task<PaymentResult> ProcessDepositAsync(string reservationId, decimal amount, PaymentMethod method)
    {
        return await ProcessPaymentAsync(new ProcessPaymentRequest
        {
            ReservationId = reservationId,
            Amount = amount,
            PaymentMethod = method,
            PaymentType = "deposit"
        });
    }

    public async Task<PaymentResult> ProcessBalanceAsync(string reservationId, PaymentMethod method)
    {
        var status = await GetPaymentStatusAsync(reservationId);
        var balanceDue = status.TotalAmount - status.AmountPaid;

        if (balanceDue <= 0)
        {
            return new PaymentResult
            {
                Success = true,
                AmountCharged = 0,
                Message = "No balance due"
            };
        }

        return await ProcessPaymentAsync(new ProcessPaymentRequest
        {
            ReservationId = reservationId,
            Amount = balanceDue,
            PaymentMethod = method,
            PaymentType = "balance"
        });
    }

    public async Task<RefundResult> ProcessRefundAsync(string reservationId, decimal amount, string reason)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/refunds", new
            {
                reservation_id = reservationId,
                amount = amount,
                reason = reason
            });

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<RefundResult>();
            return result ?? throw new Exception("Refund processing failed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process refund for reservation {ReservationId}", reservationId);
            throw;
        }
    }

    public async Task<PaymentStatus> GetPaymentStatusAsync(string reservationId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/reservations/{reservationId}/payments");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<PaymentStatus>();
            return result ?? new PaymentStatus();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get payment status for reservation {ReservationId}", reservationId);
            throw;
        }
    }
}

public record ProcessPaymentRequest
{
    public string ReservationId { get; init; } = "";
    public decimal Amount { get; init; }
    public PaymentMethod PaymentMethod { get; init; } = new();
    public string PaymentType { get; init; } = "full"; // deposit, balance, full
    public BillingAddress? BillingAddress { get; init; }
}

public record PaymentMethod
{
    public string Type { get; init; } = "card"; // card, ach
    public string Token { get; init; } = ""; // Tokenized from Track.js
}

public record BillingAddress
{
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string Address { get; init; } = "";
    public string City { get; init; } = "";
    public string State { get; init; } = "";
    public string Zip { get; init; } = "";
}

public record PaymentResult
{
    public bool Success { get; init; }
    public string? TransactionId { get; init; }
    public string? Error { get; init; }
    public string? Message { get; init; }
    public decimal AmountCharged { get; init; }
}

public record RefundResult
{
    public bool Success { get; init; }
    public string? RefundId { get; init; }
    public string? Error { get; init; }
    public decimal AmountRefunded { get; init; }
}

public record PaymentStatus
{
    public string ReservationId { get; init; } = "";
    public decimal TotalAmount { get; init; }
    public decimal AmountPaid { get; init; }
    public decimal BalanceDue { get; init; }
    public string Status { get; init; } = ""; // pending, deposit_paid, paid, refunded
    public List<PaymentTransaction> Transactions { get; init; } = new();
}

public record PaymentTransaction
{
    public string TransactionId { get; init; } = "";
    public string Type { get; init; } = ""; // payment, refund
    public decimal Amount { get; init; }
    public string Status { get; init; } = "";
    public DateTime CreatedAt { get; init; }
}
