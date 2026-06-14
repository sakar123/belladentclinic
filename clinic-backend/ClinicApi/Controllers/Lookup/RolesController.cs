using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/roles")]
    [Authorize(Policy = "AllStaff")]
    public class RolesController : LookupController<Role, RoleDto, CreateRoleDto>
    {
        public RolesController(ILookupService<Role, CreateRoleDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
