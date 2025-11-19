using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface ISaleService
    {
        Task<IEnumerable<SaleItemDTO>> GetAllSaleItemsAsync();
        Task<SaleItemDTO> GetSaleItemByIdAsync(Guid id);
        Task<SaleItemDTO> CreateSaleItemAsync(SaleItemDTO saleItemDto);
        Task<SaleItemDTO> UpdateSaleItemAsync(Guid id, SaleItemDTO saleItemDto);
        Task<bool> DeleteSaleItemAsync(Guid id);
    }
}
