using FluentAssertions;

namespace ClinicApi.Tests.Utilities;

public static class FluentAssertionsExtensions
{
    public static void ShouldBeValidGuid(this string? value)
    {
        Guid.TryParse(value, out _).Should().BeTrue($"'{value}' should be a valid GUID");
    }
}
