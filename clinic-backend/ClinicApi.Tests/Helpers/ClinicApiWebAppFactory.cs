using System;
using System.Linq;
using ClinicApi.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ClinicApi.Tests.Helpers
{
    public class ClinicApiWebAppFactory : WebApplicationFactory<Program>
    {
        // Use a single, consistent database name for the lifetime of this factory instance.
        private readonly string _dbName = $"ClinicApiTestDb_{Guid.NewGuid()}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                var dbContextDescriptors = services
                    .Where(d => d.ServiceType.IsGenericType &&
                                d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>) &&
                                d.ServiceType.GenericTypeArguments.Contains(typeof(DentalClinicContext)))
                    .ToList();
                
                var dbContextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DentalClinicContext));
                if (dbContextDescriptor != null)
                {
                    dbContextDescriptors.Add(dbContextDescriptor);
                }

                foreach (var descriptor in dbContextDescriptors)
                {
                    services.Remove(descriptor);
                }
                
                // Add the DbContext using the consistent database name.
                services.AddDbContext<DentalClinicContext>(options =>
                {
                    options.UseInMemoryDatabase(_dbName);
                });
            });
        }
    }
}

