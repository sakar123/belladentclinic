# Test runner image for ClinicApi.Tests
# Build context for this file is expected to be the 'clinic-backend' directory.
FROM mcr.microsoft.com/dotnet/sdk:9.0
WORKDIR /src

# Copy solution and project files from the parent 'clinic-backend' directory
COPY Clinic-Api.sln .
COPY ClinicApi/ClinicApi.csproj ./ClinicApi/
COPY ClinicApi.Tests/ClinicApi.Tests.csproj ./ClinicApi.Tests/

# Restore dependencies for the whole solution
RUN dotnet restore Clinic-Api.sln

# Copy the entire backend source into the container
COPY . .

# Set the working directory specifically to the test project folder
WORKDIR /src/ClinicApi.Tests

# Define the command to run the tests
CMD ["dotnet", "test", "ClinicApi.Tests.csproj", "--logger", "trx;LogFileName=test-results.trx"]
