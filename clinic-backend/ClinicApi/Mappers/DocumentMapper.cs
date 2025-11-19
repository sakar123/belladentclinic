using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Document entity and its DTO.
    /// </summary>
    public static class DocumentMapper
    {
        /// <summary>
        /// Maps a Document entity to a DocumentDTO.
        /// </summary>
        public static DocumentDTO ToDto(Document entity, HashSet<object> visited)
        {
            if (entity == null) return null;
			if (!visited.Add(entity))
			{
				return new DocumentDTO
				{
					id = entity.id,
					description = entity.description,
					document_path = entity.document_path
				};
			}
            return new DocumentDTO
            {
                id = entity.id,
                tooth_id = entity.tooth_id,
                treatment_id = entity.treatment_id,
                patient_id = entity.patient_id,
                document_type_id = entity.document_type_id,
                upload_date = entity.upload_date,
                description = entity.description,
                is_sensitive = entity.is_sensitive,
                document_path = entity.document_path
            };
        }

        /// <summary>
        /// Maps a DocumentDTO to a Document entity.
        /// </summary>
        public static Document ToEntity(DocumentDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Document
            {
                id = dto.id ?? Guid.NewGuid(),
                tooth_id = dto.tooth_id,
                treatment_id = dto.treatment_id,
                patient_id = dto.patient_id,
                document_type_id = dto.document_type_id,
                upload_date = dto.upload_date,
                description = dto.description,
                is_sensitive = dto.is_sensitive,
                document_path = dto.document_path
            };
        }
    }
}