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
    public class DocumentService : IDocumentService
    {
        private readonly IRepository<Document> _documentRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<DocumentType> _documentTypeRepository;
        private readonly IRepository<Tooth> _toothRepository;
        private readonly IRepository<Treatment> _treatmentRepository;

        public DocumentService(
            IRepository<Document> documentRepository,
            IRepository<Patient> patientRepository,
            IRepository<DocumentType> documentTypeRepository,
            IRepository<Tooth> toothRepository,
            IRepository<Treatment> treatmentRepository)
        {
            _documentRepository = documentRepository;
            _patientRepository = patientRepository;
            _documentTypeRepository = documentTypeRepository;
            _toothRepository = toothRepository;
            _treatmentRepository = treatmentRepository;
        }

        public async Task<IEnumerable<DocumentDTO>> GetAllDocumentsAsync()
        {
            var documents = await _documentRepository.GetAllAsync();
            return documents.Select(d => d.ToDto()).ToList();
        }

        public async Task<DocumentDTO> GetDocumentByIdAsync(Guid id)
        {
            var document = await _documentRepository.GetByIdAsync(id);
            return document?.ToDto();
        }

        public async Task<DocumentDTO> CreateDocumentAsync(DocumentDTO documentDto)
        {
            // Validate related entities
            if (!await _patientRepository.ExistsAsync(documentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            if (!await _documentTypeRepository.ExistsAsync(documentDto.document_type_id))
                throw new KeyNotFoundException("Document type not found");

            if (documentDto.tooth_id.HasValue && !await _toothRepository.ExistsAsync(documentDto.tooth_id.Value))
                throw new KeyNotFoundException("Tooth not found");

            if (documentDto.treatment_id.HasValue && !await _treatmentRepository.ExistsAsync(documentDto.treatment_id.Value))
                throw new KeyNotFoundException("Treatment not found");

            var document = documentDto.ToEntity();
            await _documentRepository.AddAsync(document);
            await _documentRepository.SaveChangesAsync();

            return document.ToDto();
        }

        public async Task<DocumentDTO> UpdateDocumentAsync(Guid id, DocumentDTO documentDto)
        {
            var existingDocument = await _documentRepository.GetByIdAsync(id);
            if (existingDocument == null)
                throw new KeyNotFoundException("Document not found");

            // Validate related entities
            if (existingDocument.patient_id != documentDto.patient_id &&
                !await _patientRepository.ExistsAsync(documentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            if (existingDocument.document_type_id != documentDto.document_type_id &&
                !await _documentTypeRepository.ExistsAsync(documentDto.document_type_id))
                throw new KeyNotFoundException("Document type not found");

            if (documentDto.tooth_id.HasValue &&
                existingDocument.tooth_id != documentDto.tooth_id &&
                !await _toothRepository.ExistsAsync(documentDto.tooth_id.Value))
                throw new KeyNotFoundException("Tooth not found");

            if (documentDto.treatment_id.HasValue &&
                existingDocument.treatment_id != documentDto.treatment_id &&
                !await _treatmentRepository.ExistsAsync(documentDto.treatment_id.Value))
                throw new KeyNotFoundException("Treatment not found");

            // Manually update properties
            existingDocument.patient_id = documentDto.patient_id;
            existingDocument.document_type_id = documentDto.document_type_id;
            existingDocument.tooth_id = documentDto.tooth_id;
            existingDocument.treatment_id = documentDto.treatment_id;
            existingDocument.description = documentDto.description;
            existingDocument.updated_at = DateTime.UtcNow;

            _documentRepository.Update(existingDocument);
            await _documentRepository.SaveChangesAsync();

            return existingDocument.ToDto();
        }

        public async Task<bool> DeleteDocumentAsync(Guid id)
        {
            var document = await _documentRepository.GetByIdAsync(id);
            if (document == null)
                return false;

            _documentRepository.Delete(document);
            await _documentRepository.SaveChangesAsync();
            return true;
        }
    }
}
