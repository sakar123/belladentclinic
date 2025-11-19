using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Models.Enumerations;
using System;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Person entity and its DTO.
    /// </summary>
    public static class PersonMapper
    {
        /// <summary>
        /// Maps a Person entity to a PersonDTO.
        /// </summary>
        public static PersonDTO ToDto(Person entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new PersonDTO { id = entity.id };

            return new PersonDTO
            {
                id = entity.id,
                first_name = entity.first_name,
                last_name = entity.last_name,
                date_of_birth = entity.date_of_birth,
                gender = entity.gender ?? GenderEnum.PreferNotToSay,
                email = entity.email,
                phone_number = entity.phone_number,
                address = entity.address,
                a_identifier = entity.a_identifier,
                created_at = entity.created_at,
                updated_at = entity.updated_at,
                created_by = entity.created_by,
                updated_by = entity.updated_by
            };
        }

        /// <summary>
        /// Maps a PersonDTO to a Person entity.
        /// </summary>
        public static Person ToEntity(PersonDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            //Enum.TryParse<GenderEnum>(dto.gender, true, out var genderEnum);

            return new Person
            {
                id = dto.id,
                first_name = dto.first_name,
                last_name = dto.last_name,
                date_of_birth = dto.date_of_birth,
                gender = dto.gender,
                email = dto.email,
                phone_number = dto.phone_number,
                address = dto.address,
                a_identifier = dto.a_identifier,
                created_at = dto.created_at,
                updated_at = dto.updated_at,
                created_by = dto.created_by,
                updated_by = dto.updated_by
            };
        }
    }
}