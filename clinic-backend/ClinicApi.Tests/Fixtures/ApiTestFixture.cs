using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Headers;
using ClinicApi.Tests.Utilities;
using ClinicApi.Tests.Helpers; // Required for ClinicApiWebAppFactory

namespace ClinicApi.Tests.Fixtures;

public class ApiTestFixture : IDisposable
{
    // The factory is now of the correct custom type
    private readonly ClinicApiWebAppFactory _factory;
    public HttpClient Client { get; }
    
    // This property allows tests to access the factory for seeding data
    public WebApplicationFactory<Program> WebAppFactory => _factory;

    public ApiTestFixture()
    {
        // Instantiate our custom factory to ensure the database is replaced
        _factory = new ClinicApiWebAppFactory();

        Client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        Client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public void Dispose()
    {
        Client.Dispose();
        _factory.Dispose();
    }
}

