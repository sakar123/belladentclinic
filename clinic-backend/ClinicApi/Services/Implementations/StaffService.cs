using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;
using ClinicApi.Mappers;

namespace ClinicApi.Services.Implementations
{
    public class StaffService : IStaffService
    {
        private readonly IRepository<Staff> _staffRepository;
        private readonly IRepository<Person> _personRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IRepository<Specialty> _specialtyRepository;

        public StaffService(
            IRepository<Staff> staffRepository,
            IRepository<Person> personRepository,
            IRepository<Role> roleRepository,
            IRepository<Specialty> specialtyRepository)
        {
            _staffRepository = staffRepository;
            _personRepository = personRepository;
            _roleRepository = roleRepository;
            _specialtyRepository = specialtyRepository;
        }

        public async Task<IEnumerable<StaffDTO>> GetAllStaffAsync()
        {
            var staff = await _staffRepository.GetAllAsync();
            foreach (var s in staff)
            {
                if (s.person == null && s.person_id != Guid.Empty)
                {
                    s.person = await _personRepository.GetByIdAsync(s.person_id);
                }
            }
            var visited = new HashSet<object>();
            return staff.Select(s => StaffMapper.ToDto(s, visited)).ToList();
        }

        public async Task<StaffDTO> GetStaffByIdAsync(Guid id)
        {
            var staff = await _staffRepository.GetByIdAsync(id);
            if (staff == null) return null;
            if (staff.person == null && staff.person_id != Guid.Empty)
            {
                staff.person = await _personRepository.GetByIdAsync(staff.person_id);
            }

            var visited = new HashSet<object>();
            return StaffMapper.ToDto(staff, visited);
        }

        public async Task<StaffDTO> CreateStaffAsync(StaffDTO staffDto)
        {
            // Validate Role exists
            if (!await _roleRepository.ExistsAsync(staffDto.role_id))
                throw new KeyNotFoundException("Role not found");

            // Validate Specialty exists if provided
            if (staffDto.specialty_id.HasValue && !await _specialtyRepository.ExistsAsync(staffDto.specialty_id.Value))
                throw new KeyNotFoundException("Specialty not found");

            // Create Person first
            var person = new Person
            {
                id = Guid.NewGuid(),
                first_name = staffDto.person.first_name,
                last_name = staffDto.person.last_name,
                date_of_birth = staffDto.person.date_of_birth,
                gender = staffDto.person.gender,
                phone_number = staffDto.person.phone_number,
                email = staffDto.person.email,
                address = staffDto.person.address,
                a_identifier = staffDto.person.a_identifier
            };

            await _personRepository.AddAsync(person);
            await _personRepository.SaveChangesAsync();

            // Create Staff linked to Person
            var role = await _roleRepository.GetByIdAsync(staffDto.role_id);
            Specialty specialty = null;
            if (staffDto.specialty_id.HasValue)
            {
                specialty = await _specialtyRepository.GetByIdAsync(staffDto.specialty_id.Value);
            }

            var staff = new Staff
            {
                id = Guid.NewGuid(),
                person_id = person.id,
                role_id = staffDto.role_id,
                specialty_id = staffDto.specialty_id,
                license_number = staffDto.license_number,
                is_active = staffDto.is_active,
                person = person,
                role = role,
                specialty = specialty,
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>()
            };

            await _staffRepository.AddAsync(staff);
            await _staffRepository.SaveChangesAsync();

            return StaffMapper.ToDto(staff, new HashSet<object>());
        }

        public async Task<StaffDTO> UpdateStaffAsync(Guid id, StaffDTO staffDto)
        {
            var existingStaff = await _staffRepository.GetByIdAsync(id);
            if (existingStaff == null)
                throw new KeyNotFoundException("Staff not found");

            var existingPerson = await _personRepository.GetByIdAsync(existingStaff.person_id);
            if (existingPerson == null)
                throw new KeyNotFoundException("Person not found");

            // Validate Role exists
            if (!await _roleRepository.ExistsAsync(staffDto.role_id))
                throw new KeyNotFoundException("Role not found");

            // Validate Specialty exists if provided
            if (staffDto.specialty_id.HasValue && !await _specialtyRepository.ExistsAsync(staffDto.specialty_id.Value))
                throw new KeyNotFoundException("Specialty not found");

            // Update Person manually
            existingPerson.first_name = staffDto.person.first_name;
            existingPerson.last_name = staffDto.person.last_name;
            existingPerson.date_of_birth = staffDto.person.date_of_birth;
            existingPerson.gender = staffDto.person.gender;
            existingPerson.phone_number = staffDto.person.phone_number;
            existingPerson.email = staffDto.person.email;
            existingPerson.address = staffDto.person.address;
            existingPerson.a_identifier = staffDto.person.a_identifier;

            await _personRepository.UpdateAsync(existingPerson);
            await _personRepository.SaveChangesAsync();

            // Update Staff manually
            existingStaff.role_id = staffDto.role_id;
            existingStaff.specialty_id = staffDto.specialty_id;
            existingStaff.license_number = staffDto.license_number;
            existingStaff.is_active = staffDto.is_active;

            await _staffRepository.UpdateAsync(existingStaff);
            await _staffRepository.SaveChangesAsync();

            return StaffMapper.ToDto(existingStaff, new HashSet<object>());
        }

        public async Task<bool> DeleteStaffAsync(Guid id)
        {
            var staff = await _staffRepository.GetByIdAsync(id);
            if (staff == null)
                return false;

            var person = await _personRepository.GetByIdAsync(staff.person_id);
            if (person != null)
            {
                try
                {
                    // Deleting Person cascades to Staff (per model). If there are FK references
                    // (e.g., appointments), the database will reject the delete. Translate to
                    // a meaningful operation exception so the controller can return 409.
                    await _personRepository.DeleteAsync(person);
                    await _personRepository.SaveChangesAsync();
                }
                catch (Microsoft.EntityFrameworkCore.DbUpdateException)
                {
                    throw new InvalidOperationException("Cannot delete staff because there are existing records that reference this staff member (e.g., appointments or treatments). Reassign or remove dependent records first, or mark the staff member inactive.");
                }
            }
            return true;
        }
    }
}
