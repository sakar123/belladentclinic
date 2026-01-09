using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Controllers;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ClinicApi.Tests.Unit.Controllers;

public class LandingPageControllerTests
{
    private readonly Mock<ILogger<LandingPageController>> _logger = new();
    private readonly Mock<IAppointmentService> _apptSvc = new();
    private readonly Mock<IGoogleReviewsService> _reviewsSvc = new();

    private LandingPageController CreateSut() => new(_logger.Object, _apptSvc.Object, _reviewsSvc.Object);

    [Fact]
    public async Task GetReviews_WhenServiceReturns_DataAndOk()
    {
        var data = new List<GoogleReviewDto> {
            new GoogleReviewDto{ AuthorName = "A", Rating = 5, RelativeTimeDescription = "today", Text = "Great" }
        };
        _reviewsSvc.Setup(s => s.GetReviewsAsync()).ReturnsAsync(data);

        var sut = CreateSut();
        var result = await sut.GetReviews();

        var ok = result as OkObjectResult;
        ok.Should().NotBeNull();
        ok!.StatusCode.Should().Be(200);
        ok.Value.Should().BeSameAs(data);
    }

    [Fact]
    public async Task GetReviews_WhenServiceThrows_Returns500()
    {
        _reviewsSvc.Setup(s => s.GetReviewsAsync()).ThrowsAsync(new Exception("boom"));
        var sut = CreateSut();
        var result = await sut.GetReviews();

        var obj = result as ObjectResult;
        obj.Should().NotBeNull();
        obj!.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task CreateAppointment_WhenValid_Returns201()
    {
        var request = new LandingPageAppointmentRequestDto
        {
            FullName = "John Doe",
            Email = "john@example.com",
            Phone = "+1-555-0000",
            Date = "2026-01-01",
            Time = "10:00",
            Gender = "Male",
            Message = "Please call"
        };
        _apptSvc.Setup(s => s.CreateAppointmentFromLandingPageAsync(request))
            .ReturnsAsync(new Models.Entities.Appointment { id = Guid.NewGuid() });

        var sut = CreateSut();
        var resp = await sut.CreateAppointmentAsync(request);

        var obj = resp as ObjectResult;
        obj.Should().NotBeNull();
        obj!.StatusCode.Should().Be(201);
    }

    [Fact]
    public async Task CreateAppointment_WhenArgumentException_Returns400()
    {
        var request = new LandingPageAppointmentRequestDto { FullName = "bad" };
        _apptSvc.Setup(s => s.CreateAppointmentFromLandingPageAsync(request))
            .ThrowsAsync(new ArgumentException("invalid"));

        var sut = CreateSut();
        var resp = await sut.CreateAppointmentAsync(request);
        var bad = resp as BadRequestObjectResult;
        bad.Should().NotBeNull();
        bad!.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task CreateAppointment_WhenInvalidOperationException_Returns400()
    {
        var request = new LandingPageAppointmentRequestDto { FullName = "bad" };
        _apptSvc.Setup(s => s.CreateAppointmentFromLandingPageAsync(request))
            .ThrowsAsync(new InvalidOperationException("missing"));

        var sut = CreateSut();
        var resp = await sut.CreateAppointmentAsync(request);
        var bad = resp as BadRequestObjectResult;
        bad.Should().NotBeNull();
        bad!.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task CreateAppointment_WhenOtherException_Returns500()
    {
        var request = new LandingPageAppointmentRequestDto { FullName = "bad" };
        _apptSvc.Setup(s => s.CreateAppointmentFromLandingPageAsync(request))
            .ThrowsAsync(new Exception("oops"));

        var sut = CreateSut();
        var resp = await sut.CreateAppointmentAsync(request);
        var obj = resp as ObjectResult;
        obj.Should().NotBeNull();
        obj!.StatusCode.Should().Be(500);
    }
}

