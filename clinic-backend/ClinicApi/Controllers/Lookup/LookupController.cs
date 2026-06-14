using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers.Lookup
{
    [ApiController]
    [Route("api/lookup/[controller]")]
    public abstract class LookupController<T, TDto, TCreateDto> : ControllerBase
        where T : class
        where TDto : class
        where TCreateDto : class
    {
        private readonly ILookupService<T, TCreateDto> _lookupService;
        private readonly IMapper _mapper;

        public LookupController(ILookupService<T, TCreateDto> lookupService, IMapper mapper)
        {
            _lookupService = lookupService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TDto>>> GetAll()
        {
            var entities = await _lookupService.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<TDto>>(entities);
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TDto>> GetById(Guid id)
        {
            var entity = await _lookupService.GetByIdAsync(id);
            if (entity == null)
            {
                return NotFound();
            }
            var dto = _mapper.Map<TDto>(entity);
            return Ok(dto);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPost]
        public async Task<ActionResult<TDto>> Create(TCreateDto createDto)
        {
            var entity = await _lookupService.CreateAsync(createDto);
            var dto = _mapper.Map<TDto>(entity);
            return CreatedAtAction(nameof(GetById), new { id = (dto as dynamic).id }, dto);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, TCreateDto createDto)
        {
            var entity = await _lookupService.UpdateAsync(id, createDto);
            if (entity == null)
            {
                return NotFound();
            }
            return NoContent();
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _lookupService.DeleteAsync(id);
            return NoContent();
        }
    }
}
