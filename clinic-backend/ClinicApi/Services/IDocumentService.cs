using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IDocumentService
    {
        Task<IEnumerable<DocumentDTO>> GetAllDocumentsAsync();
        Task<DocumentDTO> GetDocumentByIdAsync(Guid id);
        Task<DocumentDTO> CreateDocumentAsync(DocumentDTO documentDto);
        Task<DocumentDTO> UpdateDocumentAsync(Guid id, DocumentDTO documentDto);
        Task<bool> DeleteDocumentAsync(Guid id);
    }
}
