using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/discount-types")]
    public class DiscountTypesController : LookupController<DiscountType, DiscountTypeDto, CreateDiscountTypeDto>
    {
        public DiscountTypesController(ILookupService<DiscountType, CreateDiscountTypeDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
