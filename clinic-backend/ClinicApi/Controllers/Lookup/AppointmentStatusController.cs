using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/appointment-status")]
    public class AppointmentStatusController : LookupController<AppointmentStatus, AppointmentStatusDto, CreateAppointmentStatusDto>
    {
        public AppointmentStatusController(ILookupService<AppointmentStatus, CreateAppointmentStatusDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
