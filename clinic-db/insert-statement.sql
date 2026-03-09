	-- 1. Insert Roles
	INSERT INTO role (id, name, description) VALUES
(gen_random_uuid(), 'Dentist', 'Primary dental care provider'),
(gen_random_uuid(), 'Hygienist', 'Dental cleaning and preventive care specialist'),
(gen_random_uuid(), 'Receptionist', 'Front desk and administrative staff'),
(gen_random_uuid(), 'Oral Surgeon', 'Specializes in surgical procedures'),
(gen_random_uuid(), 'Orthodontist', 'Teeth alignment specialist'),
(gen_random_uuid(), 'Endodontist', 'Root canal specialist'),
(gen_random_uuid(), 'Periodontist', 'Gum disease specialist'),
(gen_random_uuid(), 'Prosthodontist', 'Dental prosthetics specialist'),
(gen_random_uuid(), 'Radiologist', 'Dental imaging specialist'),
(gen_random_uuid(), 'Administrator', 'Clinic management staff');
	-- 2. Insert Specialties
	INSERT INTO specialty (id, name, description) VALUES
	(gen_random_uuid(),'General Dentistry', 'Routine dental care'),
	(gen_random_uuid(),'Orthodontics', 'Teeth straightening'),
	(gen_random_uuid(),'Oral Surgery', 'Surgical procedures'),
	(gen_random_uuid(),'Pediatric Dentistry', 'Children''s dental care'),
	(gen_random_uuid(),'Endodontics', 'Root canal therapy'),
	(gen_random_uuid(),'Periodontics', 'Gum treatment'),
	(gen_random_uuid(),'Prosthodontics', 'Dental prosthetics'),
	(gen_random_uuid(),'Radiology', 'Dental imaging'),
	(gen_random_uuid(),'Cosmetic Dentistry', 'Aesthetic procedures'),
	(gen_random_uuid(),'Preventive Care', 'Cleanings and checkups');
	-- 3. Insert Persons (Staff and Patients)
	INSERT INTO person (first_name, last_name, date_of_birth, gender, email, phone_number, address) VALUES
	('John', 'Smith', '1980-05-15', 'Male', 'john.smith@example.com', '+15551234567', '123 Main St, Anytown'),
	('Sarah', 'Johnson', '1975-11-22', 'Female', 'sarah.j@example.com', '+15559876543', '456 Oak Ave, Somewhere'),
	('Michael', 'Brown', '1990-02-28', 'Male', 'm.brown@example.com', '+15551112222', '789 Pine Rd, Nowhere'),
	('Emily', 'Davis', '1988-07-10', 'Female', 'emily.d@example.com', '+15553334444', '321 Elm St, Anytown'),
	('David', 'Wilson', '1982-09-18', 'Male', 'd.wilson@example.com', '+15555556666', '654 Maple Dr, Somewhere'),
	('Lisa', 'Garcia', '1995-04-05', 'Female', 'lisa.g@example.com', '+15557778888', '987 Cedar Ln, Nowhere'),
	('Robert', 'Martinez', '1978-12-30', 'Male', 'rob.m@example.com', '+15559990000', '147 Birch Way, Anytown'),
	('Jennifer', 'Anderson', '1987-06-14', 'Female', 'j.anderson@example.com', '+15551234432', '258 Spruce Ave, Somewhere'),
	('William', 'Taylor', '1992-01-25', 'Male', 'w.taylor@example.com', '+15555678910', '369 Walnut Rd, Nowhere'),
	('Amanda', 'Thomas', '1985-08-20', 'Female', 'amanda.t@example.com', '+15552468024', '741 Cherry Blvd, Anytown'),
	('James', 'Jackson', '1993-03-12', 'Male', 'james.j@example.com', '+15551357913', '852 Ash St, Somewhere'),
	('Patricia', 'White', '1981-10-08', 'Female', 'p.white@example.com', '+15550246802', '963 Poplar Dr, Nowhere'),
	('Christopher', 'Harris', '1989-05-03', 'Male', 'c.harris@example.com', '+15551111111', '159 Willow Way, Anytown'),
	('Linda', 'Martin', '1976-11-17', 'Female', 'linda.m@example.com', '+15552222222', '753 Oak Ln, Somewhere'),
	('Daniel', 'Thompson', '1994-09-22', 'Male', 'd.thompson@example.com', '+15553333333', '456 Pine Ave, Nowhere'),
	('John', 'Smith', '1980-05-15', 'Male', 'john.smith@example1.com', '+15551234567', '123 Main St, Anytown'),
	('Sarah', 'Johnson', '1975-11-22', 'Female', 'sarah.j@example1.com', '+15559876543', '456 Oak Ave, Somewhere'),
	('Michael', 'Brown', '1990-02-28', 'Male', 'm.brown@example1.com', '+15551112222', '789 Pine Rd, Nowhere'),
	('Emily', 'Davis', '1988-07-10', 'Female', 'emily.d@example1.com', '+15553334444', '321 Elm St, Anytown'),
	('David', 'Wilson', '1982-09-18', 'Male', 'd.wilson@example1.com', '+15555556666', '654 Maple Dr, Somewhere'),
	('Lisa', 'Garcia', '1995-04-05', 'Female', 'lisa.g@example1.com', '+15557778888', '987 Cedar Ln, Nowhere'),
	('Robert', 'Martinez', '1978-12-30', 'Male', 'rob.m@example1.com', '+15559990000', '147 Birch Way, Anytown');



	INSERT INTO staff (person_id, role_id, specialty_id, license_number) VALUES
	((SELECT id FROM person WHERE email = 'john.smith@example.com'), (SELECT id FROM role WHERE name = 'Dentist'), (SELECT id FROM specialty WHERE name = 'General Dentistry'), 'DEN12345'),
	((SELECT id FROM person WHERE email = 'sarah.j@example.com'), (SELECT id FROM role WHERE name = 'Hygienist'), (SELECT id FROM specialty WHERE name = 'Preventive Care'), 'HYG67890'),
	((SELECT id FROM person WHERE email = 'm.brown@example.com'), (SELECT id FROM role WHERE name = 'Oral Surgeon'), (SELECT id FROM specialty WHERE name = 'Oral Surgery'), 'ORS11111'),
	((SELECT id FROM person WHERE email = 'emily.d@example.com'), (SELECT id FROM role WHERE name = 'Orthodontist'), (SELECT id FROM specialty WHERE name = 'Orthodontics'), 'ORT22222'),
	((SELECT id FROM person WHERE email = 'd.wilson@example.com'), (SELECT id FROM role WHERE name = 'Endodontist'), (SELECT id FROM specialty WHERE name = 'Endodontics'), 'END33333'),
	((SELECT id FROM person WHERE email = 'lisa.g@example.com'), (SELECT id FROM role WHERE name = 'Periodontist'), (SELECT id FROM specialty WHERE name = 'Periodontics'), 'PER44444'),
	((SELECT id FROM person WHERE email = 'rob.m@example.com'), (SELECT id FROM role WHERE name = 'Prosthodontist'), (SELECT id FROM specialty WHERE name = 'Prosthodontics'), 'PRO55555'),
	((SELECT id FROM person WHERE email = 'j.anderson@example.com'), (SELECT id FROM role WHERE name = 'Radiologist'), (SELECT id FROM specialty WHERE name = 'Radiology'), 'RAD66666'),
	((SELECT id FROM person WHERE email = 'w.taylor@example.com'), (SELECT id FROM role WHERE name = 'Dentist'), (SELECT id FROM specialty WHERE name = 'Cosmetic Dentistry'), 'DEN77777'),
	((SELECT id FROM person WHERE email = 'amanda.t@example.com'), (SELECT id FROM role WHERE name = 'Receptionist'), NULL, NULL),
	((SELECT id FROM person WHERE email = 'james.j@example.com'), (SELECT id FROM role WHERE name = 'Administrator'), NULL, NULL);
	-- 5. Insert Patients
	INSERT INTO patient (person_id, emergency_contact_name, emergency_contact_phone) VALUES
	((SELECT id FROM person WHERE email = 'james.j@example.com'), 'Mary Jackson', '+15559876543'),
	((SELECT id FROM person WHERE email = 'p.white@example.com'), 'Robert White', '+15551112222'),
	((SELECT id FROM person WHERE email = 'c.harris@example.com'), 'Susan Harris', '+15553334444'),
	((SELECT id FROM person WHERE email = 'linda.m@example.com'), 'David Martin', '+15555556666'),
	((SELECT id FROM person WHERE email = 'd.thompson@example.com'), 'Karen Thompson', '+15557778888'),
	((SELECT id FROM person WHERE email = 'john.smith@example1.com'), 'Jane Smith', '+15559990000'),
	((SELECT id FROM person WHERE email = 'sarah.j@example1.com'), 'Mark Johnson', '+15551234432'),
	((SELECT id FROM person WHERE email = 'm.brown@example1.com'), 'Lisa Brown', '+15555678910'),
	((SELECT id FROM person WHERE email = 'emily.d@example1.com'), 'Tom Davis', '+15552468024'),
	((SELECT id FROM person WHERE email = 'd.wilson@example1.com'), 'Nancy Wilson', '+15551357913'),
	((SELECT id FROM person WHERE email = 'lisa.g@example1.com'), 'Paul Garcia', '+15550246802'),
	((SELECT id FROM person WHERE email = 'rob.m@example1.com'), 'Amy Martinez', '+15551111111');
	-- 6. Insert Appointment Statuses
	INSERT INTO appointment_status (id, name) VALUES
(gen_random_uuid(), 'Confirmed'),
(gen_random_uuid(), 'In Progress'),
(gen_random_uuid(), 'Completed'),
(gen_random_uuid(), 'Cancelled'),
(gen_random_uuid(), 'No Show'),
(gen_random_uuid(), 'Rescheduled'),
(gen_random_uuid(), 'Checked In'),
(gen_random_uuid(), 'Delayed'),
(gen_random_uuid(), 'Arrived');
	-- 7. Insert Services
	INSERT INTO service (specialty_id, name, description, cost) VALUES
	((SELECT id FROM specialty WHERE name = 'General Dentistry'), 'Routine Checkup', 'Comprehensive dental examination', 150.00),
	((SELECT id FROM specialty WHERE name = 'Orthodontics'), 'Braces Adjustment', 'Monthly orthodontic adjustment', 100.00),
	((SELECT id FROM specialty WHERE name = 'Oral Surgery'), 'Tooth Extraction', 'Surgical removal of tooth', 300.00),
	((SELECT id FROM specialty WHERE name = 'Endodontics'), 'Root Canal', 'Root canal therapy', 800.00),
	((SELECT id FROM specialty WHERE name = 'Periodontics'), 'Deep Cleaning', 'Scaling and root planing', 250.00),
	((SELECT id FROM specialty WHERE name = 'Prosthodontics'), 'Crown Fitting', 'Dental crown placement', 1200.00),
	((SELECT id FROM specialty WHERE name = 'Radiology'), 'Dental X-Ray', 'Full mouth radiograph', 120.00),
	((SELECT id FROM specialty WHERE name = 'Cosmetic Dentistry'), 'Teeth Whitening', 'Bleaching treatment', 400.00),
	((SELECT id FROM specialty WHERE name = 'Pediatric Dentistry'), 'Child Cleaning', 'Preventive cleaning for children', 100.00),
	((SELECT id FROM specialty WHERE name = 'Preventive Care'), 'Fluoride Treatment', 'Fluoride application', 50.00),
	((SELECT id FROM specialty WHERE name = 'General Dentistry'), 'Filling', 'Amalgam filling', 200.00),
	((SELECT id FROM specialty WHERE name = 'Orthodontics'), 'Retainer Fitting', 'Custom retainer placement', 350.00);
	-- 8. Insert Tooth Statuses
	INSERT INTO tooth_status (id, code, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'HEALTHY', 'No decay or damage', NOW(), NOW()),
(gen_random_uuid(), 'DECAYED', 'Caries present', NOW(), NOW()),
(gen_random_uuid(), 'FILLED', 'Restored with filling', NOW(), NOW()),
(gen_random_uuid(), 'CROWNED', 'Covered with dental crown', NOW(), NOW()),
(gen_random_uuid(), 'MISSING', 'Tooth extracted', NOW(), NOW()),
(gen_random_uuid(), 'IMPACTED', 'Tooth not fully erupted', NOW(), NOW()),
(gen_random_uuid(), 'FRACTURED', 'Cracked or broken', NOW(), NOW()),
(gen_random_uuid(), 'ABSCESSED', 'Infection at root', NOW(), NOW()),
(gen_random_uuid(), 'ERODED', 'Worn down surface', NOW(), NOW()),
(gen_random_uuid(), 'MOBILITY', 'Loose tooth', NOW(), NOW());
	-- 9. Insert Teeth (for first patient)
	INSERT INTO tooth (patient_id, tooth_number, tooth_name, tooth_status_id) VALUES
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 1, 'Third Molar', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 2, 'Second Molar', (SELECT id FROM tooth_status WHERE code = 'FILLED')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 3, 'First Molar', (SELECT id FROM tooth_status WHERE code = 'CROWNED')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 4, 'Second Premolar', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 5, 'First Premolar', (SELECT id FROM tooth_status WHERE code = 'DECAYED')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 6, 'Canine', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 7, 'Lateral Incisor', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 8, 'Central Incisor', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 9, 'Central Incisor', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 10, 'Lateral Incisor', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 11, 'Canine', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 12, 'First Premolar', (SELECT id FROM tooth_status WHERE code = 'FILLED')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 13, 'Second Premolar', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 14, 'First Molar', (SELECT id FROM tooth_status WHERE code = 'CROWNED')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 15, 'Second Molar', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 16, 'Third Molar', (SELECT id FROM tooth_status WHERE code = 'MISSING'));
	-- 10. Insert Appointments
	INSERT INTO appointment (patient_id, staff_id, status_id, appointment_start_time, duration_minutes, reason_for_visit) VALUES
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com')), (SELECT id FROM appointment_status WHERE name = 'Scheduled'), '2023-10-01 09:00:00', 30, 'Routine checkup'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com')), (SELECT id FROM appointment_status WHERE name = 'Confirmed'), '2023-10-01 10:00:00', 45, 'Cleaning'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example.com')), (SELECT id FROM appointment_status WHERE name = 'In Progress'), '2023-10-01 11:00:00', 60, 'Tooth extraction'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example.com')), (SELECT id FROM appointment_status WHERE name = 'Completed'), '2023-10-01 13:00:00', 30, 'Braces adjustment'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example.com')), (SELECT id FROM appointment_status WHERE name = 'Cancelled'), '2023-10-01 14:00:00', 90, 'Root canal'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example.com')), (SELECT id FROM appointment_status WHERE name = 'No Show'), '2023-10-01 15:00:00', 45, 'Deep cleaning'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example.com')), (SELECT id FROM appointment_status WHERE name = 'Rescheduled'), '2023-10-01 16:00:00', 60, 'Crown fitting'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'j.anderson@example.com')), (SELECT id FROM appointment_status WHERE name = 'Checked In'), '2023-10-02 09:00:00', 30, 'X-ray'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'w.taylor@example.com')), (SELECT id FROM appointment_status WHERE name = 'Delayed'), '2023-10-02 10:00:00', 60, 'Teeth whitening'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'amanda.t@example.com')), (SELECT id FROM appointment_status WHERE name = 'Arrived'), '2023-10-02 11:00:00', 30, 'Consultation'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com')), (SELECT id FROM appointment_status WHERE name = 'Scheduled'), '2023-10-02 13:00:00', 45, 'Filling'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com')), (SELECT id FROM appointment_status WHERE name = 'Confirmed'), '2023-10-02 14:00:00', 30, 'Fluoride treatment');
	-- Allow NULL for treatment.tooth_id during seed (will backfill and enforce later)
	DO $$ BEGIN
	  IF EXISTS (
	    SELECT 1 FROM information_schema.columns 
	    WHERE table_schema = 'public' AND table_name = 'treatment' AND column_name = 'tooth_id'
	  ) THEN
	    BEGIN
	      ALTER TABLE treatment ALTER COLUMN tooth_id DROP NOT NULL;
	    EXCEPTION WHEN others THEN
	      -- ignore if already nullable
	      NULL;
	    END;
	  END IF;
	END $$;

	-- 11. Insert Treatments
	INSERT INTO treatment (appointment_id, patient_id, staff_id, service_id, tooth_number, notes) VALUES
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com')), (SELECT id FROM service WHERE name = 'Routine Checkup'), 1, 'No issues found'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com')), (SELECT id FROM service WHERE name = 'Deep Cleaning'), 2, 'Significant tartar buildup'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example.com')), (SELECT id FROM service WHERE name = 'Tooth Extraction'), 3, 'Impacted wisdom tooth'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example.com')), (SELECT id FROM service WHERE name = 'Braces Adjustment'), 4, 'Tightened wires'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example.com')), (SELECT id FROM service WHERE name = 'Root Canal'), 5, 'Severe decay'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example.com')), (SELECT id FROM service WHERE name = 'Child Cleaning'), 6, 'Gum inflammation'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example.com')), (SELECT id FROM service WHERE name = 'Crown Fitting'), 3, 'Temporary crown placed'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'j.anderson@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'j.anderson@example.com')), (SELECT id FROM service WHERE name = 'Dental X-Ray'), 7, 'Full mouth series'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'w.taylor@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'w.taylor@example.com')), (SELECT id FROM service WHERE name = 'Teeth Whitening'), 8, 'In-office bleaching'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'amanda.t@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'amanda.t@example.com')), (SELECT id FROM service WHERE name = 'Retainer Fitting'), 9, 'New patient consultation'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com')), (SELECT id FROM service WHERE name = 'Filling'), 5, 'Composite filling'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com')), (SELECT id FROM service WHERE name = 'Fluoride Treatment'), 11, 'Post-cleaning fluoride');
	-- 12. Insert Prescriptions
	INSERT INTO prescription (treatment_id, drug_name, dosage, instructions) VALUES
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Root Canal')), 'Amoxicillin', '500mg', 'Take 1 capsule three times daily for 7 days'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Routine Checkup')), 'Ibuprofen', '600mg', 'Take 1 tablet every 6 hours as needed for pain'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Deep Cleaning')), 'Chlorhexidine', '0.12%', 'Rinse with 15ml twice daily for 2 weeks'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Tooth Extraction')), 'Acetaminophen', '500mg', 'Take 2 tablets every 6 hours as needed for pain'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Braces Adjustment')), 'Lidocaine', '2%', 'Apply topically to gums as needed for discomfort'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Crown Fitting')), 'Orthodontic Wax', 'N/A', 'Apply to brackets causing irritation'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Dental X-Ray')), 'Fluoride Gel', '1.1%', 'Apply nightly before bed'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Retainer Fitting')), 'Oxycodone', '5mg', 'Take 1 tablet every 8 hours as needed for severe pain'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Teeth Whitening')), 'Penicillin VK', '500mg', 'Take 1 tablet four times daily for 10 days'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Child Cleaning')), 'Listerine', 'N/A', 'Rinse twice daily after brushing'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Filling')), 'Sensodyne', 'N/A', 'Use toothpaste for sensitive teeth'),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Fluoride Treatment')), 'Orabase', 'N/A', 'Apply to mouth sores as needed');
	-- 13. Insert Billings
	INSERT INTO billing (patient_id, issue_date, due_date, total_amount, amount_paid, status) VALUES
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), '2023-10-01', '2023-10-15', 150.00, 150.00, 'Paid'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')), '2023-10-01', '2023-10-15', 250.00, 0.00, 'Open'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')), '2023-10-01', '2023-10-15', 300.00, 150.00, 'Partial'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), '2023-10-01', '2023-10-15', 100.00, 100.00, 'Paid'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')), '2023-10-01', '2023-10-15', 800.00, 0.00, 'Void'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')), '2023-10-01', '2023-10-15', 250.00, 0.00, 'Open'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')), '2023-10-01', '2023-10-15', 1200.00, 600.00, 'Partial'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com')), '2023-10-02', '2023-10-16', 120.00, 120.00, 'Paid'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')), '2023-10-02', '2023-10-16', 400.00, 200.00, 'Partial'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com')), '2023-10-02', '2023-10-16', 150.00, 0.00, 'Draft'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')), '2023-10-02', '2023-10-16', 200.00, 0.00, 'Open'),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com')), '2023-10-02', '2023-10-16', 50.00, 50.00, 'Paid');
	-- 14. Insert Billing Line Items
	INSERT INTO billing_line_item (billing_id, treatment_id, description, quantity, unit_price, discount_percentage) VALUES
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Routine Checkup')), 'Routine Checkup', 1, 150.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Deep Cleaning')), 'Deep Cleaning', 1, 250.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Tooth Extraction')), 'Tooth Extraction', 1, 300.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Braces Adjustment')), 'Braces Adjustment', 1, 100.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Root Canal')), 'Root Canal', 1, 800.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Deep Cleaning')), 'Deep Cleaning', 1, 250.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Crown Fitting')), 'Crown Fitting', 1, 1200.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Dental X-Ray')), 'Dental X-Ray', 1, 120.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Teeth Whitening')), 'Teeth Whitening', 1, 400.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Routine Checkup')), 'Routine Checkup', 1, 150.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Filling')), 'Filling', 1, 200.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Fluoride Treatment')), 'Fluoride Treatment', 1, 50.00, 0.00);

	-- Backfill treatment.tooth_id from tooth_number + patient_id, then enforce NOT NULL
	UPDATE treatment t
	SET tooth_id = th.id
	FROM tooth th
	WHERE t.tooth_id IS NULL
	  AND th.patient_id = t.patient_id
	  AND th.tooth_number = t.tooth_number;

	-- Enforce NOT NULL after backfill
	DO $$ BEGIN
	  IF EXISTS (
	    SELECT 1 FROM information_schema.columns 
	    WHERE table_schema = 'public' AND table_name = 'treatment' AND column_name = 'tooth_id'
	  ) THEN
	    BEGIN
	      ALTER TABLE treatment ALTER COLUMN tooth_id SET NOT NULL;
	    EXCEPTION WHEN others THEN
	      -- ignore if constraint already in place
	      NULL;
	    END;
	  END IF;
	END $$;
	-- 15. Insert Discount Types
	INSERT INTO discount_type (discount_name, discount_percentage) VALUES
	('Senior Discount', 10.00),
	('Veteran Discount', 15.00),
	('Student Discount', 20.00),
	('Employee Discount', 25.00),
	('New Patient Discount', 10.00),
	('Referral Discount', 15.00),
	('Cash Payment Discount', 5.00),
	('Loyalty Discount', 10.00),
	('Family Discount', 20.00),
	('Seasonal Discount', 10.00),
	('Holiday Discount', 15.00),
	('Bulk Service Discount', 25.00);
	-- 16. Insert Sale Items
	INSERT INTO sale_item (quantity, discount_id, patient_id, cost) VALUES
	(1, (SELECT id FROM discount_type WHERE discount_name = 'New Patient Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example.com')), 25.00),
	(2, (SELECT id FROM discount_type WHERE discount_name = 'Family Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), 50.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Senior Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com')), 30.00),
	(3, (SELECT id FROM discount_type WHERE discount_name = 'Student Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')), 75.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Veteran Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example.com')), 20.00),
	(2, (SELECT id FROM discount_type WHERE discount_name = 'Employee Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com')), 40.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Cash Payment Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')), 15.00),
	(4, (SELECT id FROM discount_type WHERE discount_name = 'Loyalty Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 100.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Seasonal Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example.com')), 35.00),
	(2, (SELECT id FROM discount_type WHERE discount_name = 'Holiday Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example.com')), 60.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Referral Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example.com')), 25.00),
	(5, (SELECT id FROM discount_type WHERE discount_name = 'Bulk Service Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')), 150.00);
	-- 17. Insert Payments
	INSERT INTO payment (billing_id, amount, payment_date, method, transaction_ref, created_by) VALUES
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com'))), 150.00, '2023-10-01 10:30:00', 'Credit Card', 'TXN123456', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com'))), 250.00, '2023-10-05 14:20:00', 'Insurance', 'INS789012', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com'))), 150.00, '2023-10-03 11:15:00', 'Cash', 'CASH001', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com'))), 100.00, '2023-10-01 13:45:00', 'Mobile-Pay', 'MP345678', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com'))), 600.00, '2023-10-10 09:30:00', 'Bank Transfer', 'BT901234', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com'))), 120.00, '2023-10-02 10:00:00', 'Credit Card', 'TXN567890', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com'))), 200.00, '2023-10-08 15:20:00', 'Insurance', 'INS345678', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com'))), 50.00, '2023-10-02 14:45:00', 'Cash', 'CASH002', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com'))), 250.00, '2023-10-12 11:00:00', 'Mobile-Pay', 'MP901234', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com'))), 200.00, '2023-10-15 16:30:00', 'Bank Transfer', 'BT567890', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com'))), 150.00, '2023-10-20 09:15:00', 'Credit Card', 'TXN135790', 'test_insert'),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com'))), 800.00, '2023-10-25 13:00:00', 'Insurance', 'INS246813', 'test_insert');
	-- 18. Insert Document Types
	INSERT INTO document_type (document_type, name, description) VALUES
	('XRAY', 'Dental X-Ray', 'Radiographic image of teeth'),
	('PANO', 'Panoramic X-Ray', 'Full mouth panoramic image'),
	('CEPH', 'Cephalometric X-Ray', 'Side view of skull'),
	('PHOTO', 'Clinical Photo', 'Digital photograph'),
	('MODEL', 'Dental Model', 'Physical teeth model'),
	('SCAN', 'Digital Scan', '3D digital impression'),
	('FORM', 'Consent Form', 'Patient consent document'),
	('CERT', 'Certificate', 'Completion certificate'),
	('REPORT', 'Lab Report', 'Laboratory results'),
	('CHART', 'Treatment Chart', 'Clinical notes'),
	('INVOICE', 'Billing Invoice', 'Payment statement'),
	('RX', 'Prescription', 'Medication order');
	-- 19. Insert Documents
	INSERT INTO document (tooth_id, treatment_id, patient_id, document_type_id, description, is_sensitive, document_path) VALUES
	((SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')) AND tooth_number = 5), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Filling')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), (SELECT id FROM document_type WHERE document_type = 'XRAY'), 'Pre-treatment X-ray', FALSE, '/docs/xray_james_5_pre.jpg'),
	(NULL, (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Root Canal')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')), (SELECT id FROM document_type WHERE document_type = 'PANO'), 'Panoramic view', FALSE, '/docs/pano_d_thompson_full.jpg'),
	((SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')) AND tooth_number = 3), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Tooth Extraction')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')), (SELECT id FROM document_type WHERE document_type = 'CEPH'), 'Cephalometric analysis', FALSE, '/docs/ceph_c_harris_3.jpg'),
	(NULL, (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Braces Adjustment')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), (SELECT id FROM document_type WHERE document_type = 'PHOTO'), 'Progress photo', FALSE, '/docs/photo_linda_progress.jpg'),
	(NULL, (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Crown Fitting')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')), (SELECT id FROM document_type WHERE document_type = 'MODEL'), 'Crown model', FALSE, '/docs/model_sarah_crown.obj'),
	(NULL, (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Deep Cleaning')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')), (SELECT id FROM document_type WHERE document_type = 'SCAN'), 'Digital impression', FALSE, '/docs/scan_john_cleaning.stl'),
	(NULL, NULL, (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')), (SELECT id FROM document_type WHERE document_type = 'FORM'), 'Treatment consent', TRUE, '/docs/form_p_white_consent.pdf'),
	(NULL, NULL, (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com')), (SELECT id FROM document_type WHERE document_type = 'CERT'), 'X-ray completion', FALSE, '/docs/cert_m_brown_xray.pdf'),
	(NULL, (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Teeth Whitening')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')), (SELECT id FROM document_type WHERE document_type = 'REPORT'), 'Shade report', FALSE, '/docs/report_emily_shade.pdf'),
	(NULL, NULL, (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com')), (SELECT id FROM document_type WHERE document_type = 'CHART'), 'Initial chart', TRUE, '/docs/chart_d_wilson_initial.pdf'),
	((SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')) AND tooth_number = 5), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Filling')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')), (SELECT id FROM document_type WHERE document_type = 'XRAY'), 'Post-treatment X-ray', FALSE, '/docs/xray_lisa_5_post.jpg'),
	(NULL, NULL, (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com')), (SELECT id FROM document_type WHERE document_type = 'INVOICE'), 'Treatment invoice', FALSE, '/docs/invoice_rob_m.pdf'),
	(NULL, (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Root Canal')), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')), (SELECT id FROM document_type WHERE document_type = 'RX'), 'Post-op prescription', TRUE, '/docs/rx_d_thompson.pdf');
