using System;
using System.Collections.Generic;
using System.Linq; 
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Mappers; 
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;

namespace ClinicApi.Services.Implementations
{
    public class RoleService : IRoleService
    {
        private readonly IRepository<Role> _roleRepository;

        public RoleService(IRepository<Role> roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<IEnumerable<RoleDTO>> GetAllRolesAsync()
        {
            var roles = await _roleRepository.GetAllAsync();
            // Convert the collection of entities to a list of DTOs
            return roles.Select(r => r.ToDto()).ToList();
        }

        public async Task<RoleDTO> GetRoleByIdAsync(Guid id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            return role?.ToDto();
        }

        public async Task<RoleDTO> CreateRoleAsync(RoleDTO roleDto)
        {
            var role = roleDto.ToEntity();
            await _roleRepository.AddAsync(role);
            await _roleRepository.SaveChangesAsync();
            return role.ToDto();
        }

        public async Task<RoleDTO> UpdateRoleAsync(Guid id, RoleDTO roleDto)
        {
            var existingRole = await _roleRepository.GetByIdAsync(id);
            if (existingRole == null)
                throw new KeyNotFoundException("Role not found");

            existingRole.name = roleDto.name;
            existingRole.description = roleDto.description;
            
            _roleRepository.Update(existingRole);
            await _roleRepository.SaveChangesAsync();
            
            return existingRole.ToDto();
        }

        public async Task<bool> DeleteRoleAsync(Guid id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            if (role == null)
                return false;

            _roleRepository.Delete(role);
            await _roleRepository.SaveChangesAsync();
            return true;
        }
    }
}