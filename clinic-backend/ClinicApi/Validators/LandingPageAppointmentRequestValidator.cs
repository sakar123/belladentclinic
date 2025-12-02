using ClinicApi.Models.DTOs;
using ClinicApi.Models.Enumerations;
using FluentValidation;
using System;

namespace ClinicApi.Validators
{
    public class LandingPageAppointmentRequestValidator : AbstractValidator<LandingPageAppointmentRequestDto>
    {
        public LandingPageAppointmentRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty().WithMessage("Full name is required.");
            RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid email address is required.");
            RuleFor(x => x.Phone).NotEmpty().WithMessage("Phone number is required.");
            RuleFor(x => x.Date).NotEmpty().WithMessage("Appointment date is required.");
            RuleFor(x => x.Time).NotEmpty().WithMessage("Appointment time is required.");
            RuleFor(x => x.Gender)
                .NotEmpty().WithMessage("Gender is required.")
                .Must(gender => Enum.TryParse(typeof(GenderEnum), gender, true, out _))
                .WithMessage("Invalid gender provided. Accepted values are Male, Female, Other, or Prefer not to say.");
        }
    }
}
