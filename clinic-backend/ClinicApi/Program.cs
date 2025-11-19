using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using ClinicApi.Data;
using ClinicApi.Data.Repositories;
using ClinicApi.Services;
using ClinicApi.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// Ensure environment-specific settings are loaded if present
builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

Console.WriteLine($"Environment: {builder.Environment.EnvironmentName}");

// ✅ Debug: Try reading the connection string
var connStr = builder.Configuration.GetConnectionString("clinicDbConnection");
//var connStr = builder.Configuration.GetValue<string>("AllowedHosts");


if (string.IsNullOrWhiteSpace(connStr))
{
    Console.WriteLine("⚠️  Connection string 'clinicDbConnection' is NULL or empty!");
}
else
{
    Console.WriteLine($"✅ Connection string loaded: {connStr}");
}

// Add services to the container.
builder.Services.AddControllers();

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

// Configure DbContext (reads ConnectionStrings:clinicDbConnection from configuration)
builder.Services.AddDbContextPool<DentalClinicContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("clinicDbConnection")));

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

// Configure AutoMapper

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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

// Enable CORS in Development and Docker environments
if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Docker"))
{
    app.UseCors("DevCors");
}

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
