	using System;
	using System.ComponentModel.DataAnnotations;
using ClinicApi.Models.Enumerations;
namespace ClinicApi.Models.DTOs
{
	public class PatientDTO
	{
		public Guid? id { get; set; } // Optional for create operations
									  // Person properties
		public Guid? person_id { get; set; }

		[StringLength(100)]
		public string? emergency_contact_name { get; set; }
		[StringLength(20)]
		public string? emergency_contact_phone { get; set; }
			
		public PersonDTO person { get; set; }
	}
}