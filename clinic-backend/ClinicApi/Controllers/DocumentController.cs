using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IFileStorageService _fileStorageService;

        public DocumentController(IDocumentService documentService, IFileStorageService fileStorageService)
        {
            _documentService = documentService;
            _fileStorageService = fileStorageService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDTO>>> GetDocuments()
        {
            var documents = await _documentService.GetAllDocumentsAsync();
            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDTO>> GetDocument(Guid id)
        {
            var document = await _documentService.GetDocumentByIdAsync(id);
            if (document == null)
                return NotFound();
                
            return Ok(document);
        }

        [HttpPost]
        public async Task<ActionResult<DocumentDTO>> CreateDocument(DocumentDTO documentDto)
        {
            try
            {
                var createdDocument = await _documentService.CreateDocumentAsync(documentDto);
                return CreatedAtAction(nameof(GetDocument), new { id = createdDocument.id }, createdDocument);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("upload")]
        [RequestSizeLimit(50_000_000)] // ~50MB
        public async Task<ActionResult<DocumentDTO>> UploadDocument(
            IFormFile file, // Removed [FromForm] here to fix Swagger crash
            [FromForm] Guid patient_id,
            [FromForm] Guid document_type_id,
            [FromForm] string description,
            [FromForm] bool? is_sensitive,
            [FromForm] Guid? tooth_id,
            [FromForm] Guid? treatment_id)
        {
            if (file == null || file.Length == 0) return BadRequest("file is required");
            var safeFile = Path.GetFileName(file.FileName);
            if (safeFile.Length > 350) safeFile = safeFile[..350];
            var saveName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid()}_{safeFile}";
            var s3Key = $"documents/{patient_id}/{saveName}";

            using (var stream = file.OpenReadStream())
            {
                await _fileStorageService.UploadAsync(s3Key, stream, file.ContentType);
            }

            var dto = new DocumentDTO
            {
                patient_id = patient_id,
                document_type_id = document_type_id,
                tooth_id = tooth_id,
                treatment_id = treatment_id,
                upload_date = DateTime.UtcNow,
                description = description ?? safeFile,
                is_sensitive = is_sensitive ?? false,
                document_path = s3Key
            };
            
            try
            {
                var created = await _documentService.CreateDocumentAsync(dto);
                return CreatedAtAction(nameof(GetDocument), new { id = created.id }, created);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}/download-url")]
        public async Task<IActionResult> GetDownloadUrl(Guid id)
        {
            var document = await _documentService.GetDocumentByIdAsync(id);
            if (document == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(document.document_path) ||
                document.document_path.StartsWith("/") ||
                document.document_path.Contains("\\"))
            {
                return NotFound("This document was stored locally and cannot be downloaded via S3.");
            }

            var url = await _fileStorageService.GetPresignedUrlAsync(document.document_path);
            return Ok(new { url });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(Guid id, DocumentDTO documentDto)
        {
            try
            {
                var updatedDocument = await _documentService.UpdateDocumentAsync(id, documentDto);
                return Ok(updatedDocument);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(Guid id)
        {
            var result = await _documentService.DeleteDocumentAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}