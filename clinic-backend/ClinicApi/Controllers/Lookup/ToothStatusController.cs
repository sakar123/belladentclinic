using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/tooth-status")]
    public class ToothStatusController : LookupController<ToothStatus, ToothStatusDto, CreateToothStatusDto>
    {
        public ToothStatusController(ILookupService<ToothStatus, CreateToothStatusDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
