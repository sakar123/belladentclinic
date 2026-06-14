using ClinicApi.Services;
using FluentAssertions;
using Xunit;

namespace ClinicApi.Tests.Unit
{
    public class ToothStatusValidatorTests
    {
        [Theory]
        [InlineData("HEALTHY", "IMPLANT", false)]
        [InlineData("MISSING", "CROWNED", false)]
        [InlineData("IMPLANT", "HEALTHY", false)]
        [InlineData("CROWNED", "PONTIC", false)]
        [InlineData("HEALTHY", "CARIES", false)]
        [InlineData("HEALTHY", "HEALTHY", true)]
        [InlineData("FILLED", "CROWNED", true)]
        [InlineData("CROWNED", "BRIDGE", true)]
    public void Validate_Matrix_ReturnsExpected(string current, string next, bool expected)
        {
            var result = ToothStatusValidator.Validate(current, next);
            result.IsValid.Should().Be(expected);
        }
    }
}

