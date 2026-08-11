using ClinicApi.Services;
using FluentAssertions;
using Xunit;

namespace ClinicApi.Tests.Unit
{
    public class ToothNumberValidatorTests
    {
        [Theory]
        [InlineData(1)]
        [InlineData(32)]
        [InlineData(11)]
        [InlineData(48)]
        [InlineData(51)]
        [InlineData(85)]
        public void IsValid_WithSupportedNumbering_ReturnsTrue(int toothNumber)
        {
            ToothNumberValidator.IsValid(toothNumber).Should().BeTrue();
        }

        [Theory]
        [InlineData(0)]
        [InlineData(49)]
        [InlineData(50)]
        [InlineData(56)]
        [InlineData(80)]
        [InlineData(86)]
        [InlineData(99)]
        public void IsValid_WithUnsupportedNumbering_ReturnsFalse(int toothNumber)
        {
            ToothNumberValidator.IsValid(toothNumber).Should().BeFalse();
        }
    }
}
