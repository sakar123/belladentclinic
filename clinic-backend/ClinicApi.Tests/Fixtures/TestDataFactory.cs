using System.Text.Json.Serialization;

namespace ClinicApi.Tests.Fixtures;

// DTOs are assumed to live in your API project under a compatible namespace.
// If the namespace differs, update the 'using' where tests compile.
// We re-declare minimal records here ONLY for strongly-typed generation in tests.
// If you already expose DTOs to tests, you can delete these and use your real DTOs.

public static class TestDataFactory
{
    public static object Appointment(int? durationMinutes = 60)
    {
        return new {
            id = (string?)null,
            patient_id = Guid.NewGuid(),
            staff_id = Guid.NewGuid(),
            status_id = Guid.NewGuid(),
            appointment_start_time = DateTime.UtcNow.AddDays(1),
            duration_minutes = durationMinutes ?? 60,
            reason_for_visit = "checkup",
            notes = "arrive early"
        };
    }

    public static object Billing(double? total = 100, double? paid = 50, int status = 0)
    {
        return new {
            id = (string?)null,
            patient_id = Guid.NewGuid(),
            issue_date = DateTime.UtcNow,
            due_date = DateTime.UtcNow.AddDays(30),
            total_amount = total ?? 100,
            amount_paid = paid ?? 50,
            status
        };
    }

    public static object Document(bool sensitive = false)
    {
        return new {
            id = (string?)null,
            tooth_id = (Guid?)null,
            treatment_id = (Guid?)null,
            patient_id = Guid.NewGuid(),
            document_type_id = Guid.NewGuid(),
            upload_date = DateTime.UtcNow,
            description = "Panoramic X-ray",
            is_sensitive = sensitive,
            document_path = "/tmp/xray.png"
        };
    }

    public static object Patient()
    {
        return new {
            id = (string?)null,
            first_name = "John",
            last_name = "Doe",
            date_of_birth = (DateTime?)null,
            gender = 0,
            email = "john@example.com",
            phone_number = "555-0001",
            address = "123 Main St",
            emergency_contact_name = "Jane",
            emergency_contact_phone = "555-0002"
        };
    }

    public static object Prescription()
    {
        return new {
            id = (string?)null,
            treatment_id = Guid.NewGuid(),
            drug_name = "Amoxicillin",
            dosage = "500mg",
            instructions = "Twice daily"
        };
    }

    public static object Role()
    {
        return new {
            id = (string?)null,
            name = "Dentist",
            description = "Performs treatments"
        };
    }

    public static object Sale()
    {
        return new {
            id = (string?)null,
            quantity = 1,
            discount_id = (Guid?)null,
            patient_id = (Guid?)null,
            cost = 25.5
        };
    }

    public static object Service()
    {
        return new {
            id = (string?)null,
            specialty_id = (Guid?)null,
            name = "Cleaning",
            description = "Basic cleaning",
            cost = 79.99
        };
    }

    public static object Specialty()
    {
        return new {
            id = (string?)null,
            name = "Orthodontics",
            description = "Braces & alignment"
        };
    }

    public static object Staff()
    {
        return new {
            id = (string?)null,
            first_name = "Alice",
            last_name = "Smith",
            date_of_birth = (DateTime?)null,
            gender = 0,
            email = "alice@clinic.test",
            phone_number = "555-1111",
            address = "456 Center Rd",
            role_id = Guid.NewGuid(),
            specialty_id = (Guid?)null,
            license_number = "LIC-123",
            is_active = true
        };
    }

    public static object Tooth()
    {
        return new {
            id = (string?)null,
            patient_id = Guid.NewGuid(),
            tooth_number = 12,
            tooth_name = "Upper Right Premolar",
            tooth_status_id = Guid.NewGuid()
        };
    }

    public static object Treatment()
    {
        return new {
            id = (string?)null,
            appointment_id = Guid.NewGuid(),
            patient_id = Guid.NewGuid(),
            staff_id = Guid.NewGuid(),
            service_id = Guid.NewGuid(),
            tooth_number = (int?)null,
            notes = "N/A"
        };
    }
}
