
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities; // Assuming this namespace contains DocumentType
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    public static class DocumentTypeMapper
    {
        public static DocumentTypeDTO ToDto(DocumentType entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new DocumentTypeDTO { id = entity.id, name = entity.name, document_type = entity.document_type_code };

            return new DocumentTypeDTO
            {
                id = entity.id,
                name = entity.name,
                description = entity.description,
                document_type = entity.document_type_code
            };
        }

        public static DocumentType ToEntity(DocumentTypeDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;
            
            //Cannot create an entity that is not defined.
            throw new System.NotImplementedException("The DocumentType entity definition is missing.");
        }
    }
}