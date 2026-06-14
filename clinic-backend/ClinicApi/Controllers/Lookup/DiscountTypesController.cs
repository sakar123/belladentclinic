using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/discount-types")]
    [Authorize(Policy = "AllStaff")]
    public class DiscountTypesController : LookupController<DiscountType, DiscountTypeDto, CreateDiscountTypeDto>
    {
        public DiscountTypesController(ILookupService<DiscountType, CreateDiscountTypeDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
