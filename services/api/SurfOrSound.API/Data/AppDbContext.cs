using Microsoft.EntityFrameworkCore;
using SurfOrSound.API.Models.Entities;

namespace SurfOrSound.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Users
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<GuestFavorite> GuestFavorites => Set<GuestFavorite>();
    public DbSet<Owner> Owners => Set<Owner>();

    // Loyalty & Gamification
    public DbSet<LoyaltyTransaction> LoyaltyTransactions => Set<LoyaltyTransaction>();
    public DbSet<Referral> Referrals => Set<Referral>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<GuestAchievement> GuestAchievements => Set<GuestAchievement>();

    // Smart Home
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<DeviceAccessCode> DeviceAccessCodes => Set<DeviceAccessCode>();

    // Marketplace
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<VendorListing> VendorListings => Set<VendorListing>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<MarketplaceCategory> MarketplaceCategories => Set<MarketplaceCategory>();

    // Reviews
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<PropertyReview> PropertyReviews => Set<PropertyReview>();
    public DbSet<ReviewHelpful> ReviewHelpfuls => Set<ReviewHelpful>();
    public DbSet<ReviewRequest> ReviewRequests => Set<ReviewRequest>();

    // AI & Chat
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationMessage> ConversationMessages => Set<ConversationMessage>();
    public DbSet<ConversationFeedback> ConversationFeedbacks => Set<ConversationFeedback>();

    // Itinerary & Search
    public DbSet<TripItinerary> TripItineraries => Set<TripItinerary>();
    public DbSet<ItineraryItem> ItineraryItems => Set<ItineraryItem>();
    public DbSet<SearchHistory> SearchHistories => Set<SearchHistory>();
    public DbSet<PropertyView> PropertyViews => Set<PropertyView>();

    // Notifications
    public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();

    // Service Requests
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<ServiceRequestNote> ServiceRequestNotes => Set<ServiceRequestNote>();

    // Owner Portal
    public DbSet<OwnerPayout> OwnerPayouts => Set<OwnerPayout>();

    // Trip Videos
    public DbSet<TripVideo> TripVideos => Set<TripVideo>();

    // Analytics
    public DbSet<AnalyticsEvent> AnalyticsEvents => Set<AnalyticsEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ==================== USERS ====================

        modelBuilder.Entity<Guest>(e =>
        {
            e.HasKey(g => g.Id);
            e.HasIndex(g => g.Email).IsUnique();
            e.HasIndex(g => g.TrackGuestId);
            e.HasIndex(g => g.LegacyId);
            e.HasIndex(g => g.PmsUserId);
            e.HasIndex(g => g.UmbracoMemberId);
            e.HasIndex(g => g.IsMigrated);
            e.HasIndex(g => g.RequiresPasswordReset);
            e.HasIndex(g => g.IsLockedOut);
            e.Property(g => g.LoyaltyTier).HasDefaultValue("Explorer");
            e.Property(g => g.LoyaltyPoints).HasDefaultValue(0);
            e.Property(g => g.AllowLoginWithLegacyPassword).HasDefaultValue(false);
            e.Property(g => g.EmailMarketingOptIn).HasDefaultValue(false);
            e.Property(g => g.IsInactive).HasDefaultValue(false);
            e.Property(g => g.IsLockedOut).HasDefaultValue(false);
            e.Property(g => g.IsMigrated).HasDefaultValue(false);
            e.Property(g => g.RequiresPasswordReset).HasDefaultValue(false);
        });

        modelBuilder.Entity<GuestFavorite>(e =>
        {
            e.HasKey(gf => gf.Id);
            e.HasIndex(gf => new { gf.GuestId, gf.PropertyTrackId }).IsUnique();
            e.HasOne<Guest>().WithMany().HasForeignKey(gf => gf.GuestId);
        });

        modelBuilder.Entity<Owner>(e =>
        {
            e.HasKey(o => o.Id);
            e.HasIndex(o => o.Email).IsUnique();
            e.HasIndex(o => o.TrackOwnerId);
        });

        // ==================== LOYALTY & GAMIFICATION ====================

        modelBuilder.Entity<LoyaltyTransaction>(e =>
        {
            e.HasKey(lt => lt.Id);
            e.HasIndex(lt => lt.GuestId);
            e.HasIndex(lt => lt.CreatedAt);
            e.HasOne<Guest>().WithMany().HasForeignKey(lt => lt.GuestId);
        });

        modelBuilder.Entity<Referral>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.ReferralCode).IsUnique();
            e.HasIndex(r => r.ReferrerId);
            e.HasIndex(r => r.ReferredGuestId);
        });

        modelBuilder.Entity<Achievement>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasIndex(a => a.Code).IsUnique();
            e.HasIndex(a => a.Category);
            e.HasIndex(a => a.IsActive);
        });

        modelBuilder.Entity<GuestAchievement>(e =>
        {
            e.HasKey(ga => ga.Id);
            e.HasIndex(ga => ga.GuestId);
            e.HasIndex(ga => ga.AchievementId);
            e.HasIndex(ga => new { ga.GuestId, ga.AchievementId }).IsUnique();
            e.HasOne(ga => ga.Achievement).WithMany().HasForeignKey(ga => ga.AchievementId);
        });

        // ==================== SMART HOME ====================

        modelBuilder.Entity<Device>(e =>
        {
            e.HasKey(d => d.Id);
            e.HasIndex(d => d.PropertyTrackId);
            e.HasIndex(d => d.ExternalDeviceId);
        });

        modelBuilder.Entity<DeviceAccessCode>(e =>
        {
            e.HasKey(dac => dac.Id);
            e.HasIndex(dac => dac.DeviceId);
            e.HasIndex(dac => dac.ReservationTrackId);
            e.HasIndex(dac => new { dac.DeviceId, dac.ReservationTrackId });
        });

        // ==================== MARKETPLACE ====================

        modelBuilder.Entity<Vendor>(e =>
        {
            e.HasKey(v => v.Id);
            e.HasIndex(v => v.Email).IsUnique();
            e.HasIndex(v => v.Slug).IsUnique();
            e.Property(v => v.Tier).HasDefaultValue("Basic");
            e.Property(v => v.Status).HasDefaultValue("pending");
        });

        modelBuilder.Entity<VendorListing>(e =>
        {
            e.HasKey(vl => vl.Id);
            e.HasIndex(vl => vl.VendorId);
            e.HasIndex(vl => vl.Slug);
            e.HasOne<Vendor>().WithMany().HasForeignKey(vl => vl.VendorId);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasKey(o => o.Id);
            e.HasOne<Guest>().WithMany().HasForeignKey(o => o.GuestId);
            e.HasIndex(o => o.GuestId);
            e.HasIndex(o => o.TrackReservationId);
            e.HasIndex(o => o.Status);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasKey(oi => oi.Id);
            e.HasOne<Order>().WithMany(o => o.Items).HasForeignKey(oi => oi.OrderId);
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasIndex(p => p.Slug).IsUnique();
        });

        modelBuilder.Entity<MarketplaceCategory>(e =>
        {
            e.HasKey(mc => mc.Id);
            e.HasIndex(mc => mc.Slug).IsUnique();
            e.HasIndex(mc => mc.ParentId);
        });

        // ==================== REVIEWS ====================

        modelBuilder.Entity<PropertyReview>(e =>
        {
            e.HasKey(pr => pr.Id);
            e.HasIndex(pr => pr.GuestId);
            e.HasIndex(pr => pr.PropertyTrackId);
            e.HasIndex(pr => pr.TrackReservationId);
            e.HasIndex(pr => pr.Status);
            e.HasIndex(pr => pr.CreatedAt);
            e.HasIndex(pr => new { pr.PropertyTrackId, pr.Status, pr.CreatedAt });
        });

        modelBuilder.Entity<ReviewHelpful>(e =>
        {
            e.HasKey(rh => rh.Id);
            e.HasIndex(rh => rh.ReviewId);
            e.HasIndex(rh => new { rh.ReviewId, rh.GuestId }).IsUnique();
        });

        modelBuilder.Entity<ReviewRequest>(e =>
        {
            e.HasKey(rr => rr.Id);
            e.HasIndex(rr => rr.GuestId);
            e.HasIndex(rr => rr.TrackReservationId).IsUnique();
            e.HasIndex(rr => rr.Status);
        });

        // ==================== AI & CHAT ====================

        modelBuilder.Entity<Conversation>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasIndex(c => c.GuestId);
            e.HasIndex(c => c.SessionId);
            e.HasIndex(c => c.Status);
            e.HasIndex(c => c.CreatedAt);
            e.HasOne<Guest>().WithMany().HasForeignKey(c => c.GuestId);
            e.HasMany(c => c.Messages).WithOne(m => m.Conversation).HasForeignKey(m => m.ConversationId);
        });

        modelBuilder.Entity<ConversationMessage>(e =>
        {
            e.HasKey(m => m.Id);
            e.HasIndex(m => m.ConversationId);
            e.HasIndex(m => m.CreatedAt);
        });

        modelBuilder.Entity<ConversationFeedback>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasIndex(f => f.MessageId);
            e.HasOne<ConversationMessage>().WithMany().HasForeignKey(f => f.MessageId);
        });

        // ==================== ITINERARY & SEARCH ====================

        modelBuilder.Entity<TripItinerary>(e =>
        {
            e.HasKey(ti => ti.Id);
            e.HasIndex(ti => ti.GuestId);
            e.HasIndex(ti => ti.TrackReservationId);
            e.HasIndex(ti => ti.Status);
            e.HasMany(ti => ti.Items).WithOne(i => i.Itinerary).HasForeignKey(i => i.ItineraryId);
        });

        modelBuilder.Entity<ItineraryItem>(e =>
        {
            e.HasKey(ii => ii.Id);
            e.HasIndex(ii => ii.ItineraryId);
            e.HasIndex(ii => ii.Date);
        });

        modelBuilder.Entity<SearchHistory>(e =>
        {
            e.HasKey(sh => sh.Id);
            e.HasIndex(sh => sh.GuestId);
            e.HasIndex(sh => sh.SessionId);
            e.HasIndex(sh => sh.CreatedAt);
            e.HasIndex(sh => sh.SearchType);
        });

        modelBuilder.Entity<PropertyView>(e =>
        {
            e.HasKey(pv => pv.Id);
            e.HasIndex(pv => pv.GuestId);
            e.HasIndex(pv => pv.PropertyTrackId);
            e.HasIndex(pv => pv.ViewedAt);
        });

        // ==================== NOTIFICATIONS ====================

        modelBuilder.Entity<PushSubscription>(e =>
        {
            e.HasKey(ps => ps.Id);
            e.HasIndex(ps => ps.GuestId);
            e.HasIndex(ps => ps.OwnerId);
            e.HasIndex(ps => ps.DeviceToken);
            e.HasIndex(ps => ps.IsActive);
        });

        modelBuilder.Entity<NotificationPreference>(e =>
        {
            e.HasKey(np => np.Id);
            e.HasIndex(np => np.GuestId).IsUnique();
            e.HasIndex(np => np.OwnerId).IsUnique();
        });

        modelBuilder.Entity<Notification>(e =>
        {
            e.HasKey(n => n.Id);
            e.HasIndex(n => n.GuestId);
            e.HasIndex(n => n.OwnerId);
            e.HasIndex(n => n.Type);
            e.HasIndex(n => n.IsRead);
            e.HasIndex(n => n.CreatedAt);
        });

        modelBuilder.Entity<NotificationLog>(e =>
        {
            e.HasKey(nl => nl.Id);
            e.HasIndex(nl => nl.NotificationId);
            e.HasIndex(nl => nl.Status);
        });

        // ==================== SERVICE REQUESTS ====================

        modelBuilder.Entity<ServiceRequest>(e =>
        {
            e.HasKey(sr => sr.Id);
            e.HasIndex(sr => sr.GuestId);
            e.HasIndex(sr => sr.PropertyTrackId);
            e.HasIndex(sr => sr.TrackReservationId);
            e.HasIndex(sr => sr.Status);
            e.HasIndex(sr => sr.Priority);
        });

        modelBuilder.Entity<ServiceRequestNote>(e =>
        {
            e.HasKey(srn => srn.Id);
            e.HasIndex(srn => srn.ServiceRequestId);
        });

        // ==================== OWNER PORTAL ====================

        modelBuilder.Entity<OwnerPayout>(e =>
        {
            e.HasKey(op => op.Id);
            e.HasIndex(op => op.OwnerId);
            e.HasIndex(op => op.PropertyTrackId);
            e.HasIndex(op => op.Status);
            e.HasIndex(op => op.PaidDate);
            e.Property(op => op.GrossAmount).HasPrecision(18, 2);
            e.Property(op => op.CommissionAmount).HasPrecision(18, 2);
            e.Property(op => op.NetAmount).HasPrecision(18, 2);
        });

        // ==================== TRIP VIDEOS ====================

        modelBuilder.Entity<TripVideo>(e =>
        {
            e.HasKey(tv => tv.Id);
            e.HasIndex(tv => tv.GuestId);
            e.HasIndex(tv => tv.TrackReservationId);
            e.HasIndex(tv => tv.Status);
        });

        // ==================== ANALYTICS ====================

        modelBuilder.Entity<AnalyticsEvent>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasIndex(a => a.SessionId);
            e.HasIndex(a => a.EventType);
            e.HasIndex(a => a.CreatedAt);
        });
    }
}
