using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/roles")]
    public class RolesController : LookupController<Role, RoleDto, CreateRoleDto>
    {
        public RolesController(ILookupService<Role, CreateRoleDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
