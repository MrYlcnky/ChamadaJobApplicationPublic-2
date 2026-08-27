using FluentValidation;
using FluentValidation.AspNetCore;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Infrastructure.Services;
using IsBasvuru.Persistence.Context;
using IsBasvuru.Persistence.Services;
using IsBasvuru.WebAPI.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using IsBasvuru.WebAPI.BackgroundServices;

// 1. SERILOG BOOTSTRAP CONFIGURATION
var bootstrapConfiguration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
    .AddEnvironmentVariables()
    .Build();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(bootstrapConfiguration)
    .CreateLogger();

try
{
    Log.Information("Starting application...");
    var builder = WebApplication.CreateBuilder(args);


    // 2. INTEGRATE SERILOG
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // DATABASE CONNECTION
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<IsBasvuruContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

    // SERVICE REGISTRATIONS

    // Company & Definitions
    builder.Services.AddScoped<ISubeService, SubeService>();
    builder.Services.AddScoped<ISubeAlanService, SubeAlanService>();
    builder.Services.AddScoped<IDepartmanService, DepartmanService>();
    builder.Services.AddScoped<IDepartmanPozisyonService, DepartmanPozisyonService>();
    
    builder.Services.AddScoped<IUlkeService, UlkeService>();
    builder.Services.AddScoped<ISehirService, SehirService>();
    builder.Services.AddScoped<IIlceService, IlceService>();
    builder.Services.AddScoped<IUyrukService, UyrukService>();
    builder.Services.AddScoped<IDilService, DilService>();
    builder.Services.AddScoped<IEhliyetTuruService, EhliyetTuruService>();
    builder.Services.AddScoped<IKktcBelgeService, KktcBelgeService>();
    builder.Services.AddScoped<IKvkkService, KvkkService>();
    builder.Services.AddScoped<IOyunBilgisiService, OyunBilgisiService>();
    builder.Services.AddScoped<IProgramBilgisiService, ProgramBilgisiService>();


 

    // File & Image Services
    builder.Services.AddScoped<IImageService, ImageService>();

    // Personal Info Services
    builder.Services.AddScoped<IPersonelService, PersonelService>();

    builder.Services.AddScoped<IReferansArastirmasiService, ReferansArastirmasiService>();

    // Master App & Auth Services
    builder.Services.AddScoped<IMasterBasvuruService, MasterBasvuruService>();
    builder.Services.AddScoped<IPanelKullaniciService, PanelKullaniciService>();
    builder.Services.AddScoped<ILogService, LogService>();
    builder.Services.AddScoped<IKimlikDogrulamaService, KimlikDogrulamaService>();

    //Master-Alan Departman Pozisyon
    builder.Services.AddScoped<IMasterAlanService, MasterAlanService>();
    builder.Services.AddScoped<IMasterDepartmanService, MasterDepartmanService>();
    builder.Services.AddScoped<IMasterPozisyonService, MasterPozisyonService>();
    builder.Services.AddScoped<IMasterProgramService, MasterProgramService>();
    builder.Services.AddScoped<IMasterOyunService, MasterOyunService>();
    builder.Services.AddScoped<IMasterGorevService, MasterGorevService>();
    builder.Services.AddScoped<IGorevService, GorevService>();
    builder.Services.AddScoped<IGorevAtamaDetayService, GorevAtamaDetayService>();
    builder.Services.AddScoped<ICalismaIzinBelgeTuruService, CalismaIzinBelgeTuruService>();

    //Rol
    builder.Services.AddScoped<IAuthService, AuthService>();

    //Backup Yedekleme
    builder.Services.AddScoped<IYedeklemeMailAlicisiService, YedeklemeMailAlicisiService>();
    builder.Services.AddScoped<IYedeklemeService, YedeklemeService>();
    builder.Services.AddScoped<IGoogleDriveService, GoogleDriveService>();
    builder.Services.AddHostedService<OtomatikYedeklemeBackgroundService>();

    builder.Services.AddHttpContextAccessor(); 
    builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

    // Mail Service
    builder.Services.AddScoped<IMailService, MailService>();

    // AutoMapper
    builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

    // Caching
    builder.Services.AddMemoryCache();

    // RATE LIMITING (İSTEK SINIRLANDIRMA) AYARLARI
    builder.Services.AddRateLimiter(options =>
    {
        options.AddPolicy(
            "LoginRatePolicy",
            httpContext =>
            {
                var ipAddress =
                    httpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ipAddress,
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder =
                            QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }
                );
            });

        options.AddPolicy(
            "OtpSendRatePolicy",
            httpContext =>
            {
                var ipAddress =
                    httpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ipAddress,
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder =
                            QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }
                );
            });

        options.AddPolicy(
                "OtpVerifyRatePolicy",
                httpContext =>
                {
                    var ipAddress =
                        httpContext.Connection.RemoteIpAddress?.ToString()
                        ?? "unknown";

                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: ipAddress,
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 10,
                            Window = TimeSpan.FromMinutes(1),
                            QueueProcessingOrder =
                                QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0,
                            AutoReplenishment = true
                        }
                    );
                });

        options.RejectionStatusCode =
            StatusCodes.Status429TooManyRequests;
    });

    // VALIDATION
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddFluentValidationClientsideAdapters();
    builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

    // CONTROLLER SETTINGS
    builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            })
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    // 1. Gerekli Servisleri (Logger ve IP) Yakalıyoruz
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                    var ipAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString();
                    var endpoint = context.HttpContext.Request.Path;

                    // 2. Loglanacak Veriyi Hazırlıyoruz (MASKELEME İPTAL EDİLDİ)
                   var validationDetailsForLog = context.ModelState .Where(e => e.Value != null && e.Value.Errors.Count > 0 )
                         .Select(x => new
                         {
                             Alan = x.Key,
                             Hatalar = x.Value!.Errors.Select(e => e.ErrorMessage) .ToList()
                         }) .ToList();

                    logger.LogWarning(
                        "VALIDATION_FAILED | Endpoint: {Endpoint} | IP: {IpAddress} | Hatalar: {@ValidationDetails}",
                        endpoint,
                        ipAddress,
                        validationDetailsForLog
                    );

                    // 4. Frontend'e gidecek mevcut kodunuz (Sadece hata mesajları birleştirilip gönderilir)
                    var errors = context.ModelState
                        .Where(e => e.Value != null && e.Value.Errors.Count > 0)
                        .SelectMany(x => x.Value!.Errors)
                        .Select(x => x.ErrorMessage)
                        .ToList();

                    var errorMsg = string.Join(" | ", errors);
                    var response = IsBasvuru.Domain.Wrappers.ServiceResponse<IsBasvuru.Domain.DTOs.Shared.NoContent>.FailureResult(errorMsg);

                    return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(response);
                };
            });

    builder.Services.AddEndpointsApiExplorer();

    // SWAGGER SETTINGS
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "IsBasvuru API", Version = "v1" });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "Enter JWT Token as 'Bearer [space] token'. Example: Bearer eyJhbGciOi...",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement()
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    },
                    Scheme = "oauth2",
                    Name = "Bearer",
                    In = ParameterLocation.Header,
                },
                new List<string>()
            }
        });
    });

    // CORS SETTINGS
    var allowedOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()
        ?? Array.Empty<string>();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy(
            "AllowFrontend",
            policy =>
            {
                if (builder.Environment.IsDevelopment())
                {
                    policy
                        .WithOrigins(
                            "https://localhost:5173"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();

                    return;
                }

                if (allowedOrigins.Length == 0)
                {
                    throw new InvalidOperationException(
                        "Cors:AllowedOrigins production ortamında yapılandırılmalıdır."
                    );
                }

                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
    });

    //CRSF
    var csrfAllowedOrigins = builder.Environment.IsDevelopment()
    ? new HashSet<string>(
        new[]
        {
            "https://localhost:5173"
        },
        StringComparer.OrdinalIgnoreCase
    )
    : new HashSet<string>(
        allowedOrigins,
        StringComparer.OrdinalIgnoreCase
    );

    // SERVICE REGISTRATIONS
    builder.Services.AddHttpClient();
    builder.Services.AddScoped<IRecaptchaService, RecaptchaService>();

    // JWT AUTHENTICATION
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["Key"];

    if (string.IsNullOrEmpty(secretKey))
    {
        throw new Exception("Critical Error: JWT SecurityKey not found in configuration!");
    }

    var key = Encoding.UTF8.GetBytes(secretKey);

    builder.Services.AddAuthentication(x =>
    {
        x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(x =>
    {
        // Require HTTPS in Production
        x.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        x.SaveToken = true;
        x.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
        x.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var hasAuthorizationHeader =
                    context.Request.Headers.ContainsKey("Authorization");

                if (!hasAuthorizationHeader)
                {
                    var cookieToken = context.Request.Cookies["AuthToken"];

                    if (!string.IsNullOrWhiteSpace(cookieToken))
                    {
                        context.Token = cookieToken;
                    }
                }

                return Task.CompletedTask;
            }
        };
    });

    var app = builder.Build();

    var forwardedOptions = new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
    };

    // Hazır olan nesneyi kullanıyoruz
    app.UseForwardedHeaders(forwardedOptions);


    // MIDDLEWARE PIPELINE


    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        // Production Security: HSTS
        app.UseHsts();
    }

    app.UseHttpsRedirection();

    // --- GÜVENLİK HEADER'LARI MIDDLEWARE BAŞLANGICI ---
    // SECURITY HEADERS
    app.Use(async (context, next) =>
    {
        context.Response.Headers["X-Frame-Options"] = "DENY";

        context.Response.Headers["X-Content-Type-Options"] =
            "nosniff";

        context.Response.Headers["Referrer-Policy"] =
            "strict-origin-when-cross-origin";

        context.Response.Headers["Permissions-Policy"] =
            "camera=(), microphone=(), geolocation=()";

        context.Response.Headers["Content-Security-Policy"] =
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none';";

        await next();
    });

    // CORS must be before StaticFiles
    app.UseCors("AllowFrontend");

    app.Use(async (context, next) =>
    {
        var request = context.Request;

        bool unsafeMethod =
            HttpMethods.IsPost(request.Method) ||
            HttpMethods.IsPut(request.Method) ||
            HttpMethods.IsPatch(request.Method) ||
            HttpMethods.IsDelete(request.Method);

        bool adminCookieVar =
            request.Cookies.ContainsKey("AuthToken");

        if (unsafeMethod && adminCookieVar)
        {
            var origin =
                request.Headers.Origin
                    .FirstOrDefault();

            if (string.IsNullOrWhiteSpace(origin) ||
                !csrfAllowedOrigins.Contains(origin))
            {
                context.Response.StatusCode =
                    StatusCodes.Status403Forbidden;

                await context.Response.WriteAsJsonAsync(
                    new
                    {
                        success = false,
                        message =
                            "İsteğin kaynağı doğrulanamadı."
                    }
                );

                return;
            }
        }

        await next();
    });

    app.UseRateLimiter();

    app.UseStaticFiles();

    app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly! (Fatal Error)");
}
finally
{
    Log.CloseAndFlush();
}