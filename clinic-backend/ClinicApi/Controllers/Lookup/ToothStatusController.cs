using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/tooth-status")]
    [Authorize(Policy = "AllStaff")]
    public class ToothStatusController : LookupController<ToothStatus, ToothStatusDto, CreateToothStatusDto>
    {
        public ToothStatusController(ILookupService<ToothStatus, CreateToothStatusDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
