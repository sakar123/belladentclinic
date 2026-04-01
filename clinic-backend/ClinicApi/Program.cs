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
using System.Collections.Generic;
using FluentValidation;
using FluentValidation.AspNetCore;
using ClinicApi.Middleware;
using ClinicApi.Models.AppSettings;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs.Lookup;

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

    // Ensure environment-specific settings are loaded if present, plus optional local overlay
    builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: false, reloadOnChange: true);
    builder.Configuration.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

    // Log the runtime environment and configured EnvironmentName
    var runtimeEnv = builder.Environment.EnvironmentName;
    var configuredEnvName = builder.Configuration["EnvironmentName"] ?? "(unset)";
    Log.Information("Runtime environment = {RuntimeEnv}; Config EnvironmentName = {ConfigEnv}", runtimeEnv, configuredEnvName);

    // Add services to the container.
    builder.Services.AddControllers()
        .AddJsonOptions(opts =>
        {
            opts.JsonSerializerOptions.Converters.Add(new ClinicApi.Converters.NullableGuidEmptyToNullConverter());
        });
    // Configure FluentValidation
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

    // CORS: read allowed origins from configuration (Cors:AllowedOrigins)
    builder.Services.AddCors(options =>
    {
        var allowedOriginsFromConfig = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        var mergedOrigins = new HashSet<string>(allowedOriginsFromConfig, StringComparer.OrdinalIgnoreCase)
        {
            "https://belladentclinic.com",
            "https://www.belladentclinic.com"
        };
         options.AddPolicy("DevCors", policy =>
            policy.WithOrigins([.. mergedOrigins])
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
        );
    });

    // Configure DbContext (database stores text values; no enum mapping needed)
    builder.Services.AddDbContextPool<DentalClinicContext>((serviceProvider, options) =>
    {
        var connString = builder.Configuration.GetConnectionString("clinicDbConnection");
        options.UseNpgsql(connString);
        options.ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    });

    // Configure EmailSettings and ClinicSettings
    builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
    builder.Services.Configure<ClinicSettings>(builder.Configuration.GetSection("ClinicSettings"));

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
    builder.Services.AddScoped(typeof(ILookupService<,>), typeof(LookupService<,>));
    builder.Services.AddScoped<ILookupService<AppointmentStatus, CreateAppointmentStatusDto>, LookupService<AppointmentStatus, CreateAppointmentStatusDto>>();
    builder.Services.AddScoped<ILookupService<DocumentType, CreateDocumentTypeDto>, LookupService<DocumentType, CreateDocumentTypeDto>>();
    builder.Services.AddScoped<ILookupService<DiscountType, CreateDiscountTypeDto>, LookupService<DiscountType, CreateDiscountTypeDto>>();
    builder.Services.AddScoped<ILookupService<Role, CreateRoleDto>, LookupService<Role, CreateRoleDto>>();
    builder.Services.AddScoped<ILookupService<ToothStatus, CreateToothStatusDto>, LookupService<ToothStatus, CreateToothStatusDto>>();


    // Configure AutoMapper
    builder.Services.AddAutoMapper(Assembly.GetExecutingAssembly());

    // Add Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();
    
    //Setup Database
    if (app.Environment.IsDevelopment())
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<DentalClinicContext>();
            db.Database.Migrate();
        }
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

    // Enable routing then CORS (recommended order for preflight handling)
    app.UseRouting();
    app.UseCors("DevCors");

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
