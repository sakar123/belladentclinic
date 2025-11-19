using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleDTO>> GetAllRolesAsync();
        Task<RoleDTO> GetRoleByIdAsync(Guid id);
        Task<RoleDTO> CreateRoleAsync(RoleDTO roleDto);
        Task<RoleDTO> UpdateRoleAsync(Guid id, RoleDTO roleDto);
        Task<bool> DeleteRoleAsync(Guid id);
    }
}
