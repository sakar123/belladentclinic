using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/appointment-status")]
    [Authorize(Policy = "AllStaff")]
    public class AppointmentStatusController : LookupController<AppointmentStatus, AppointmentStatusDto, CreateAppointmentStatusDto>
    {
        public AppointmentStatusController(ILookupService<AppointmentStatus, CreateAppointmentStatusDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
