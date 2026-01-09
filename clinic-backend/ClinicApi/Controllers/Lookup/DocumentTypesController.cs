using AutoMapper;
using ClinicApi.Controllers.Lookup;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [Route("api/lookup/document-types")]
    public class DocumentTypesController : LookupController<DocumentType, DocumentTypeDto, CreateDocumentTypeDto>
    {
        public DocumentTypesController(ILookupService<DocumentType, CreateDocumentTypeDto> lookupService, IMapper mapper)
            : base(lookupService, mapper)
        {
        }
    }
}
