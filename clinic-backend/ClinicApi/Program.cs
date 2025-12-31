using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using ClinicApi.Data;
using ClinicApi.Data.Repositories;
using ClinicApi.Services;
using ClinicApi.Services.Implementations;
using Serilog;
using System;
using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;
using ClinicApi.Middleware;
using ClinicApi.Models.AppSettings;

// Configure Serilog bootstrap logger (console + rolling file)
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        path: "logs/clinic-api-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        rollOnFileSizeLimit: true)
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting ClinicApi web host");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for logging (sinks configured via appsettings)
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // Ensure environment-specific settings are loaded if present
    builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: false, reloadOnChange: true);

    // Add services to the container.
    builder.Services.AddControllers();
    // Configure FluentValidation
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

    // CORS for local/dev usage (Portal at http://localhost:3000, Landing at http://localhost:3001)
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DevCors", policy =>
            policy.WithOrigins(
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3001"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
        );
    });

    // Configure DbContext (database stores text values; no enum mapping needed)
    var connString = builder.Configuration.GetConnectionString("clinicDbConnection");
    builder.Services.AddDbContextPool<DentalClinicContext>(options =>
        options.UseNpgsql(connString));

    // Configure EmailSettings
    builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

    // Register repositories
    builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

    // Register services
    builder.Services.AddScoped<IAppointmentService, AppointmentService>();
    builder.Services.AddScoped<IBillingService, BillingService>();
    builder.Services.AddScoped<IDocumentService, DocumentService>();
    builder.Services.AddScoped<IPatientService, PatientService>();
    builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
    builder.Services.AddScoped<IRoleService, RoleService>();
    builder.Services.AddScoped<ISaleService, SaleService>();
    builder.Services.AddScoped<IServiceService, ServiceService>();
    builder.Services.AddScoped<ISpecialtyService, SpecialtyService>();
    builder.Services.AddScoped<IStaffService, StaffService>();
    builder.Services.AddScoped<IToothService, ToothService>();
    builder.Services.AddScoped<ITreatmentService, TreatmentService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped<IGoogleReviewsService, GoogleReviewsService>();

    // Configure AutoMapper

    // Add Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();
    
    //Setup Database
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<DentalClinicContext>();
        db.Database.Migrate();
    }

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Docker"))
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Avoid HTTPS redirection during local dev/Docker to prevent mixed-content/redirect issues
    if (app.Environment.IsProduction())
    {
        app.UseHttpsRedirection();
    }
    
    // Add request context enrichment then Serilog request logging
    app.UseMiddleware<RequestLoggingContextMiddleware>();
    app.UseSerilogRequestLogging();

    // Enable CORS in Development and Docker environments
    if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Docker"))
    {
        app.UseCors("DevCors");
    }

    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}


public partial class Program { }
