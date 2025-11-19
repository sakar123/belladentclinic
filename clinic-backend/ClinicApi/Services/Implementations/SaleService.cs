using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;

namespace ClinicApi.Services.Implementations
{
    public class SaleService : ISaleService
    {
        private readonly IRepository<SaleItem> _saleItemRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<DiscountType> _discountTypeRepository;

        public SaleService(
            IRepository<SaleItem> saleItemRepository,
            IRepository<Patient> patientRepository,
            IRepository<DiscountType> discountTypeRepository)
        {
            _saleItemRepository = saleItemRepository;
            _patientRepository = patientRepository;
            _discountTypeRepository = discountTypeRepository;
        }

        public async Task<IEnumerable<SaleItemDTO>> GetAllSaleItemsAsync()
        {
            var saleItems = await _saleItemRepository.GetAllAsync();
            var visited = new HashSet<object>();

            return saleItems.Select(s => SaleItemMapper.ToDto(s, visited)).ToList();
        }

        public async Task<SaleItemDTO> GetSaleItemByIdAsync(Guid id)
        {
            var saleItem = await _saleItemRepository.GetByIdAsync(id);
            var visited = new HashSet<object>();

            return SaleItemMapper.ToDto(saleItem, visited);
        }

        public async Task<SaleItemDTO> CreateSaleItemAsync(SaleItemDTO saleItemDto)
        {
            if (saleItemDto.patient_id.HasValue && !await _patientRepository.ExistsAsync(saleItemDto.patient_id.Value))
                throw new KeyNotFoundException("Patient not found");

            if (saleItemDto.discount_id.HasValue && !await _discountTypeRepository.ExistsAsync(saleItemDto.discount_id.Value))
                throw new KeyNotFoundException("Discount type not found");

            var visited = new HashSet<object>();
            var saleItem = SaleItemMapper.ToEntity(saleItemDto, visited);

            await _saleItemRepository.AddAsync(saleItem);
            await _saleItemRepository.SaveChangesAsync();

            return SaleItemMapper.ToDto(saleItem, new HashSet<object>());
        }

        public async Task<SaleItemDTO> UpdateSaleItemAsync(Guid id, SaleItemDTO saleItemDto)
        {
            var existingSaleItem = await _saleItemRepository.GetByIdAsync(id);
            if (existingSaleItem == null)
                throw new KeyNotFoundException("Sale item not found");

            if (saleItemDto.patient_id.HasValue && !await _patientRepository.ExistsAsync(saleItemDto.patient_id.Value))
                throw new KeyNotFoundException("Patient not found");

            if (saleItemDto.discount_id.HasValue && !await _discountTypeRepository.ExistsAsync(saleItemDto.discount_id.Value))
                throw new KeyNotFoundException("Discount type not found");

            // Manual update instead of AutoMapper
            existingSaleItem.quantity = saleItemDto.quantity;
            existingSaleItem.discount_id = saleItemDto.discount_id;
            existingSaleItem.patient_id = saleItemDto.patient_id;
            existingSaleItem.cost = saleItemDto.cost;
            existingSaleItem.updated_at = DateTime.UtcNow;

            _saleItemRepository.Update(existingSaleItem);
            await _saleItemRepository.SaveChangesAsync();

            return SaleItemMapper.ToDto(existingSaleItem, new HashSet<object>());
        }

        public async Task<bool> DeleteSaleItemAsync(Guid id)
        {
            var saleItem = await _saleItemRepository.GetByIdAsync(id);
            if (saleItem == null)
                return false;

            _saleItemRepository.Delete(saleItem);
            await _saleItemRepository.SaveChangesAsync();
            return true;
        }
    }
}
