using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Patient entity and its DTO.
    /// </summary>
    public static class PatientMapper
    {
        /// <summary>
        /// Maps a Patient entity to a PatientDTO.
        /// </summary>
        public static PatientDTO ToDto(Patient entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new PatientDTO { id = entity.id };

            return new PatientDTO
            {
                id = entity.id,
                person_id = entity.person_id,
                emergency_contact_name = entity.emergency_contact_name,
                emergency_contact_phone = entity.emergency_contact_phone,
                person = PersonMapper.ToDto(entity.Person, visited)
            };
        }

        /// <summary>
        /// Maps a PatientDTO to a Patient entity.
        /// </summary>
        public static Patient ToEntity(PatientDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Patient
            {
                id = dto.id ?? Guid.NewGuid(),
                person_id = dto.person_id ?? Guid.Empty,
                emergency_contact_name = dto.emergency_contact_name,
                emergency_contact_phone = dto.emergency_contact_phone,
                // Set required Person property (assuming you have a way to map or retrieve Person)
                Person = new Person
                {
                    id = dto.person_id ?? Guid.Empty,
                    first_name = string.Empty,
                    last_name = string.Empty,
                    email = string.Empty,
                    phone_number = string.Empty,
                    address = string.Empty,
                    a_identifier = string.Empty
                },
                // Initialize required collections
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>(),
                billings = new List<Billing>(),
                teeth = new List<Tooth>(),
                documents = new List<Document>(),
                sale_items = new List<SaleItem>()
            };
        }
    }
}
