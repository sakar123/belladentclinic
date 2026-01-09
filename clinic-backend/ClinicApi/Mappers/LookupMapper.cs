using AutoMapper;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Models.Entities;

namespace ClinicApi.Mappers
{
    public class LookupMapper : Profile
    {
        public LookupMapper()
        {
            CreateMap<AppointmentStatus, AppointmentStatusDto>().ReverseMap();
            CreateMap<AppointmentStatus, CreateAppointmentStatusDto>().ReverseMap();

            CreateMap<DocumentType, DocumentTypeDto>().ReverseMap();
            CreateMap<DocumentType, CreateDocumentTypeDto>().ReverseMap();

            CreateMap<DiscountType, DiscountTypeDto>().ReverseMap();
            CreateMap<DiscountType, CreateDiscountTypeDto>().ReverseMap();

            CreateMap<Role, RoleDto>().ReverseMap();
            CreateMap<Role, CreateRoleDto>().ReverseMap();

            CreateMap<ToothStatus, ToothStatusDto>().ReverseMap();
            CreateMap<ToothStatus, CreateToothStatusDto>().ReverseMap();
        }
    }
}
