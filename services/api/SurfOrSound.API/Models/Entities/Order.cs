namespace SurfOrSound.API.Models.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GuestId { get; set; }
    public string? TrackReservationId { get; set; }
    public string OrderType { get; set; } = ""; // marketplace, merch
    public string Status { get; set; } = "pending"; // pending, confirmed, processing, shipped, delivered, cancelled
    public decimal Subtotal { get; set; }
    public decimal Commission { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string FulfillmentType { get; set; } = "ship_home"; // ship_home, stage_property, pickup
    public string? TrackPaymentId { get; set; }
    public string? ShippingName { get; set; }
    public string? ShippingAddress { get; set; }
    public string? ShippingCity { get; set; }
    public string? ShippingState { get; set; }
    public string? ShippingZip { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? VendorListingId { get; set; }
    public Guid? VendorId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public string? Options { get; set; } // JSON for size, color, etc.
    public DateTime? ServiceDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string? Description { get; set; }
    public string Category { get; set; } = ""; // apparel, accessories, home, gifts
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Options { get; set; } // JSON for sizes, colors, etc.
    public int StockQuantity { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
