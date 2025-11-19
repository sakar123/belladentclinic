# ClinicApi.Tests

Enterprise-grade test suite for ClinicApi based on the provided OpenAPI spec.

## How to use

1. Ensure your API project exists at `../ClinicApi/ClinicApi.csproj` and has a `Program` class.
2. From this folder, run:
   ```bash
   dotnet restore
   dotnet test --settings coverage.runsettings
   ```

## Notes

- Uses xUnit + FluentAssertions.
- Integration tests use `WebApplicationFactory<Program>`.
- All DTO property names in tests are snake_case to match your API schema.
- Follows AAA, single Act, minimal conditionals, parameterized tests where useful.
- Separate Unit vs Integration.
- Coverage via Coverlet collector.
