using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Provides convenient extension methods for mapping between entities and DTOs.
    /// </summary>
    public static class MappingExtensions
    {
        // Appointment Mappings
        public static AppointmentDTO ToDto(this Appointment entity, HashSet<object> visited = null) => AppointmentMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Appointment ToEntity(this AppointmentDTO dto, HashSet<object> visited = null) => AppointmentMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // AppointmentStatus Mappings
        public static AppointmentStatusDTO ToDto(this AppointmentStatus entity, HashSet<object> visited = null) => AppointmentStatusMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static AppointmentStatus ToEntity(this AppointmentStatusDTO dto, HashSet<object> visited = null) => AppointmentStatusMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Billing Mappings
        public static BillingDTO ToDto(this Billing entity, HashSet<object> visited = null) => BillingMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Billing ToEntity(this BillingDTO dto, HashSet<object> visited = null) => BillingMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // BillingLineItem Mappings
        public static BillingLineItemDTO ToDto(this BillingLineItem entity, HashSet<object> visited = null) => BillingLineItemMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static BillingLineItem ToEntity(this BillingLineItemDTO dto, HashSet<object> visited = null) => BillingLineItemMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // DiscountType Mappings
        public static DiscountTypeDTO ToDto(this DiscountType entity, HashSet<object> visited = null) => DiscountTypeMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static DiscountType ToEntity(this DiscountTypeDTO dto, HashSet<object> visited = null) => DiscountTypeMapper.ToEntity(dto, visited ?? new HashSet<object>());
        
        // Document Mappings
        public static DocumentDTO ToDto(this Document entity, HashSet<object> visited = null) => DocumentMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Document ToEntity(this DocumentDTO dto, HashSet<object> visited = null) => DocumentMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Patient Mappings
        public static PatientDTO ToDto(this Patient entity, HashSet<object> visited = null) => PatientMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Patient ToEntity(this PatientDTO dto, HashSet<object> visited = null) => PatientMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Payment Mappings
        public static PaymentDTO ToDto(this Payment entity, HashSet<object> visited = null) => PaymentMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Payment ToEntity(this PaymentDTO dto, HashSet<object> visited = null) => PaymentMapper.ToEntity(dto, visited ?? new HashSet<object>());
        
        // Person Mappings
        public static PersonDTO ToDto(this Person entity, HashSet<object> visited = null) => PersonMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Person ToEntity(this PersonDTO dto, HashSet<object> visited = null) => PersonMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Prescription Mappings
        public static PrescriptionDTO ToDto(this Prescription entity, HashSet<object> visited = null) => PrescriptionMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Prescription ToEntity(this PrescriptionDTO dto, HashSet<object> visited = null) => PrescriptionMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Role Mappings
        public static RoleDTO ToDto(this Role entity, HashSet<object> visited = null) => RoleMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Role ToEntity(this RoleDTO dto, HashSet<object> visited = null) => RoleMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // SaleItem Mappings
        public static SaleItemDTO ToDto(this SaleItem entity, HashSet<object> visited = null) => SaleItemMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static SaleItem ToEntity(this SaleItemDTO dto, HashSet<object> visited = null) => SaleItemMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Service Mappings
        public static ServiceDTO ToDto(this Service entity, HashSet<object> visited = null) => ServiceMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Service ToEntity(this ServiceDTO dto, HashSet<object> visited = null) => ServiceMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Specialty Mappings
        public static SpecialtyDTO ToDto(this Specialty entity, HashSet<object> visited = null) => SpecialtyMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Specialty ToEntity(this SpecialtyDTO dto, HashSet<object> visited = null) => SpecialtyMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Staff Mappings
        public static StaffDTO ToDto(this Staff entity, HashSet<object> visited = null) => StaffMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Staff ToEntity(this StaffDTO dto, HashSet<object> visited = null) => StaffMapper.ToEntity(dto, visited ?? new HashSet<object>());
        
        // Tooth Mappings
        public static ToothDTO ToDto(this Tooth entity, HashSet<object> visited = null) => ToothMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Tooth ToEntity(this ToothDTO dto, HashSet<object> visited = null) => ToothMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // ToothStatus Mappings
        public static ToothStatusDTO ToDto(this ToothStatus entity, HashSet<object> visited = null) => ToothStatusMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static ToothStatus ToEntity(this ToothStatusDTO dto, HashSet<object> visited = null) => ToothStatusMapper.ToEntity(dto, visited ?? new HashSet<object>());

        // Treatment Mappings
        public static TreatmentDTO ToDto(this Treatment entity, HashSet<object> visited = null) => TreatmentMapper.ToDto(entity, visited ?? new HashSet<object>());
        public static Treatment ToEntity(this TreatmentDTO dto, HashSet<object> visited = null) => TreatmentMapper.ToEntity(dto, visited ?? new HashSet<object>());
    }
}