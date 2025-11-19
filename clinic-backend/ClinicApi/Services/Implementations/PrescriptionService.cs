using System;
using System.Collections.Generic;
using System.Linq; // Required for .Select()
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Mappers; // Required for extension methods
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;

namespace ClinicApi.Services.Implementations
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IRepository<Prescription> _prescriptionRepository;
        private readonly IRepository<Treatment> _treatmentRepository;

        public PrescriptionService(
            IRepository<Prescription> prescriptionRepository,
            IRepository<Treatment> treatmentRepository)
        {
            _prescriptionRepository = prescriptionRepository;
            _treatmentRepository = treatmentRepository;
        }

        public async Task<IEnumerable<PrescriptionDTO>> GetAllPrescriptionsAsync()
        {
            var prescriptions = await _prescriptionRepository.GetAllAsync();
            // Convert the collection of entities to a list of DTOs
            return prescriptions.Select(p => p.ToDto()).ToList();
        }

        public async Task<PrescriptionDTO> GetPrescriptionByIdAsync(Guid id)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(id);
            // Use the .ToDto() extension method, handling nulls gracefully
            return prescription?.ToDto();
        }

        public async Task<PrescriptionDTO> CreatePrescriptionAsync(PrescriptionDTO prescriptionDto)
        {
            if (!await _treatmentRepository.ExistsAsync(prescriptionDto.treatment_id))
                throw new KeyNotFoundException("Treatment not found");

            // Use the .ToEntity() extension method to map the DTO to a new entity
            var prescription = prescriptionDto.ToEntity();
            await _prescriptionRepository.AddAsync(prescription);
            await _prescriptionRepository.SaveChangesAsync();
            
            // Return the DTO representation of the newly created entity
            return prescription.ToDto();
        }

        public async Task<PrescriptionDTO> UpdatePrescriptionAsync(Guid id, PrescriptionDTO prescriptionDto)
        {
            var existingPrescription = await _prescriptionRepository.GetByIdAsync(id);
            if (existingPrescription == null)
                throw new KeyNotFoundException("Prescription not found");

            if (existingPrescription.treatment_id != prescriptionDto.treatment_id && 
                !await _treatmentRepository.ExistsAsync(prescriptionDto.treatment_id))
            {
                throw new KeyNotFoundException("Treatment not found");
            }

            // Manually update the properties of the existing entity
            existingPrescription.treatment_id = prescriptionDto.treatment_id;
            existingPrescription.drug_name = prescriptionDto.drug_name;
            existingPrescription.dosage = prescriptionDto.dosage;
            existingPrescription.instructions = prescriptionDto.instructions;
            existingPrescription.updated_at = DateTime.UtcNow;
            
            _prescriptionRepository.Update(existingPrescription);
            await _prescriptionRepository.SaveChangesAsync();
            
            return existingPrescription.ToDto();
        }

        public async Task<bool> DeletePrescriptionAsync(Guid id)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(id);
            if (prescription == null)
                return false;

            _prescriptionRepository.Delete(prescription);
            await _prescriptionRepository.SaveChangesAsync();
            return true;
        }
    }
}