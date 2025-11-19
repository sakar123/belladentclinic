using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;

namespace ClinicApi.Services.Implementations
{
    public class ServiceService : IServiceService
    {
        private readonly IRepository<Service> _serviceRepository;
        private readonly IRepository<Specialty> _specialtyRepository;

        public ServiceService(
            IRepository<Service> serviceRepository,
            IRepository<Specialty> specialtyRepository)
        {
            _serviceRepository = serviceRepository;
            _specialtyRepository = specialtyRepository;
        }

        public async Task<IEnumerable<ServiceDTO>> GetAllServicesAsync()
        {
            var services = await _serviceRepository.GetAllAsync();
            var visited = new HashSet<object>();

            return services.Select(s => ServiceMapper.ToDto(s, visited)).ToList();
        }

        public async Task<ServiceDTO> GetServiceByIdAsync(Guid id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            var visited = new HashSet<object>();

            return ServiceMapper.ToDto(service, visited);
        }

        public async Task<ServiceDTO> CreateServiceAsync(ServiceDTO serviceDto)
        {
            if (serviceDto.specialty_id.HasValue && !await _specialtyRepository.ExistsAsync(serviceDto.specialty_id.Value))
                throw new KeyNotFoundException("Specialty not found");

            var visited = new HashSet<object>();
            var service = ServiceMapper.ToEntity(serviceDto, visited);

            await _serviceRepository.AddAsync(service);
            await _serviceRepository.SaveChangesAsync();

            return ServiceMapper.ToDto(service, new HashSet<object>());
        }

        public async Task<ServiceDTO> UpdateServiceAsync(Guid id, ServiceDTO serviceDto)
        {
            var existingService = await _serviceRepository.GetByIdAsync(id);
            if (existingService == null)
                throw new KeyNotFoundException("Service not found");

            if (serviceDto.specialty_id.HasValue && !await _specialtyRepository.ExistsAsync(serviceDto.specialty_id.Value))
                throw new KeyNotFoundException("Specialty not found");

            // Manual property updates (instead of AutoMapper)
            existingService.specialty_id = serviceDto.specialty_id;
            existingService.name = serviceDto.name;
            existingService.description = serviceDto.description;
            existingService.cost = serviceDto.cost;

            _serviceRepository.Update(existingService);
            await _serviceRepository.SaveChangesAsync();

            return ServiceMapper.ToDto(existingService, new HashSet<object>());
        }

        public async Task<bool> DeleteServiceAsync(Guid id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null)
                return false;

            _serviceRepository.Delete(service);
            await _serviceRepository.SaveChangesAsync();
            return true;
        }
    }
}
