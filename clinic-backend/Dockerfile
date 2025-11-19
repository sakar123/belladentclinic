# Multi-target Dockerfile for .NET API and Tests

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src

# Copy solution and project files first (better layer caching)
COPY clinic-backend/Clinic-Api.sln .
COPY clinic-backend/ClinicApi/ClinicApi.csproj ClinicApi/
COPY clinic-backend/ClinicApi.Tests/ClinicApi.Tests.csproj ClinicApi.Tests/
RUN dotnet restore Clinic-Api.sln

# Copy the rest of the source
COPY clinic-backend/ .

# Build and publish the API
FROM restore AS build-api
WORKDIR /src/ClinicApi
RUN dotnet publish ClinicApi.csproj -c Release -o /app/publish --no-restore

# API runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS api
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build-api /app/publish .
ENTRYPOINT ["dotnet", "ClinicApi.dll"]

# Test runner image (on-demand, one-shot)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS tests
WORKDIR /src
COPY clinic-backend/ .
# Default command runs the test suite. Override via docker-compose if needed.
CMD ["dotnet", "test", "Clinic-Api.sln", "--logger", "trx;LogFileName=test-results.trx"]

