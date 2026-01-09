using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ClinicApi.Services
{
    public interface ILookupService<T, TCreateDto> where T : class where TCreateDto : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> GetByIdAsync(Guid id);
        Task<T> CreateAsync(TCreateDto dto);
        Task<T> UpdateAsync(Guid id, TCreateDto dto);
        Task DeleteAsync(Guid id);
    }
}
