using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SurfOrSound.API.Data;
using SurfOrSound.API.Integrations.Track;
using SurfOrSound.API.Integrations.Sanity;
using SurfOrSound.API.Integrations.RemoteLock;
using SurfOrSound.API.Services;
using SurfOrSound.API.Middleware;
using SurfOrSound.API.Hubs;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// DATABASE
// ============================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ============================================
// CACHING - Redis (with fallback to memory cache)
// ============================================
builder.Services.AddMemoryCache(); // Required by PropertyService
var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnection;
        options.InstanceName = "SurfOrSound:";
    });
}
else
{
    builder.Services.AddDistributedMemoryCache();
}
builder.Services.AddSingleton<ICacheService, RedisCacheService>();

// ============================================
// SIGNALR - Real-time Communication
// ============================================
var signalRConnection = builder.Configuration.GetConnectionString("SignalR");
var signalRBuilder = builder.Services.AddSignalR();
if (!string.IsNullOrEmpty(signalRConnection))
{
    signalRBuilder.AddAzureSignalR(signalRConnection);
}

// ============================================
// HTTP CLIENT FACTORY
// ============================================
builder.Services.AddHttpClient();

// ============================================
// TRACK PMS INTEGRATION
// ============================================
builder.Services.Configure<TrackSettings>(builder.Configuration.GetSection("Track"));
builder.Services.AddHttpClient<ITrackClient, TrackClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Track:BaseUrl"] ?? "https://api.trackhs.com/v1");
    client.DefaultRequestHeaders.Add("X-Api-Key", builder.Configuration["Track:ApiKey"]);
    client.DefaultRequestHeaders.Add("X-Property-Manager-Id", builder.Configuration["Track:PropertyManagerId"]);
});
builder.Services.AddHttpClient<ITrackPaymentsClient, TrackPaymentsClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Track:PaymentsUrl"] ?? "https://payments.trackhs.com/v1");
    client.DefaultRequestHeaders.Add("X-Api-Key", builder.Configuration["Track:ApiKey"]);
});

// ============================================
// SANITY CMS INTEGRATION
// ============================================
builder.Services.Configure<SanitySettings>(builder.Configuration.GetSection("Sanity"));
builder.Services.AddHttpClient<ISanityClient, SanityClient>();

// ============================================
// REMOTELOCK SMART HOME INTEGRATION
// ============================================
builder.Services.Configure<RemoteLockSettings>(builder.Configuration.GetSection("RemoteLock"));
builder.Services.AddHttpClient<IRemoteLockClient, RemoteLockClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["RemoteLock:BaseUrl"] ?? "https://api.remotelock.com");
    var accessToken = builder.Configuration["RemoteLock:AccessToken"];
    if (!string.IsNullOrEmpty(accessToken))
    {
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
    }
});

// ============================================
// APPLICATION SERVICES
// ============================================

// Core Services
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IGuestService, GuestService>();
builder.Services.AddScoped<IDeviceService, DeviceService>();
builder.Services.AddScoped<IAIService, AIService>();
builder.Services.AddScoped<ITripService, TripService>();
builder.Services.AddScoped<IReviewService, ReviewService>();

// Real-time & Notifications
builder.Services.AddScoped<INotificationService, NotificationService>();

// Gamification
builder.Services.AddScoped<IAchievementService, AchievementService>();

// Migration Services
builder.Services.AddScoped<IMemberMigrationService, MemberMigrationService>();

// ============================================
// AUTHENTICATION - JWT
// ============================================
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "SurfOrSound";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Configure SignalR authentication
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ============================================
// CORS
// ============================================
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
                new[] { "http://localhost:3000", "http://localhost:3001", "http://localhost:8081" })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ============================================
// CONTROLLERS & API
// ============================================
builder.Services.AddControllers();

// ============================================
// HEALTH CHECKS
// ============================================
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

// ============================================
// SWAGGER/OPENAPI
// ============================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Surf or Sound API",
        Version = "v1",
        Description = "API for Surf or Sound vacation rental platform - The best booking experience for Hatteras Island"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ============================================
// BUILD APPLICATION
// ============================================
var app = builder.Build();

// ============================================
// MIDDLEWARE PIPELINE
// ============================================

// Development only
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Surf or Sound API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<ErrorHandlingMiddleware>();

// ============================================
// ENDPOINTS
// ============================================

// Health check endpoint
app.MapHealthChecks("/health");

// API Controllers
app.MapControllers();

// SignalR Hubs
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
