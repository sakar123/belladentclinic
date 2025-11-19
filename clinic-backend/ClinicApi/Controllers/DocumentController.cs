using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
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
