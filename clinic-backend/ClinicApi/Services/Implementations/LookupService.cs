using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.Entities;

namespace ClinicApi.Services.Implementations
{
    public class LookupService<T, TCreateDto> : ILookupService<T, TCreateDto>
        where T : class
        where TCreateDto : class
    {
        private readonly IRepository<T> _repository;
        private readonly IMapper _mapper;

        public LookupService(IRepository<T> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<T> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<T> CreateAsync(TCreateDto dto)
        {
            var entity = _mapper.Map<T>(dto);
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            return entity;
        }

        public async Task<T> UpdateAsync(Guid id, TCreateDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
            {
                return null;
            }

            _mapper.Map(dto, entity);
            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();
            return entity;
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity != null)
            {
                await _repository.DeleteAsync(entity);
                await _repository.SaveChangesAsync();
            }
        }
    }
}
