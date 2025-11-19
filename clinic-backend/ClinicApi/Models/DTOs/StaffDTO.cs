	using System;
	using System.ComponentModel.DataAnnotations;
using ClinicApi.Models.Enumerations;
namespace ClinicApi.Models.DTOs
	{
	public class StaffDTO
	{
		public Guid? id { get; set; } // Optional for create operations
									  // Person properties
		public Guid? person_id { get; set; }
		// Staff-specific properties
		[Required]
		public Guid role_id { get; set; }
		public Guid? specialty_id { get; set; }
		[StringLength(50)]
		public required string license_number { get; set; }
		public bool is_active { get; set; } = true;
		public PersonDTO person { get; set; }

	    }
	}