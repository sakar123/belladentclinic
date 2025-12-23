using ClinicApi.Models.DTOs;
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
                .MaximumLength(50).WithMessage("Gender is too long.");
        }
    }
}
