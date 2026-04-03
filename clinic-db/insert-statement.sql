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
(gen_random_uuid(), 'Scheduled'),
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
	-- 7b. Insert Service Tooth Scopes
	INSERT INTO service_tooth_scope (service_id, tooth_scope) VALUES
	((SELECT id FROM service WHERE name = 'Routine Checkup'), 'FullMouth'),
	((SELECT id FROM service WHERE name = 'Braces Adjustment'), 'MultipleTeeth'),
	((SELECT id FROM service WHERE name = 'Tooth Extraction'), 'SingleTooth'),
	((SELECT id FROM service WHERE name = 'Root Canal'), 'SingleTooth'),
	((SELECT id FROM service WHERE name = 'Deep Cleaning'), 'FullMouth'),
	((SELECT id FROM service WHERE name = 'Crown Fitting'), 'SingleTooth'),
	((SELECT id FROM service WHERE name = 'Dental X-Ray'), 'FullMouth'),
	((SELECT id FROM service WHERE name = 'Teeth Whitening'), 'FullMouth'),
	((SELECT id FROM service WHERE name = 'Child Cleaning'), 'FullMouth'),
	((SELECT id FROM service WHERE name = 'Fluoride Treatment'), 'NonTooth'),
	((SELECT id FROM service WHERE name = 'Filling'), 'SingleTooth'),
	((SELECT id FROM service WHERE name = 'Retainer Fitting'), 'MultipleTeeth');
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
	-- 9. Insert Teeth (for first patient + teeth needed for treatments)
	INSERT INTO tooth (patient_id, tooth_number, tooth_name, tooth_status_id) VALUES
	-- james.j@example.com (full set upper arch)
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
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 16, 'Third Molar', (SELECT id FROM tooth_status WHERE code = 'MISSING')),
	-- c.harris@example.com (tooth 3 for extraction)
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')), 3, 'First Molar', (SELECT id FROM tooth_status WHERE code = 'IMPACTED')),
	-- d.thompson@example.com (tooth 5 for root canal)
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')), 5, 'First Premolar', (SELECT id FROM tooth_status WHERE code = 'DECAYED')),
	-- linda.m@example.com (teeth 4,5 for braces adjustment)
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), 4, 'Second Premolar', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), 5, 'First Premolar', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	-- sarah.j@example1.com (tooth 3 for crown fitting)
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')), 3, 'First Molar', (SELECT id FROM tooth_status WHERE code = 'FRACTURED')),
	-- emily.d@example1.com (teeth 8,9 for retainer fitting)
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')), 8, 'Central Incisor', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')), 9, 'Central Incisor', (SELECT id FROM tooth_status WHERE code = 'HEALTHY')),
	-- lisa.g@example1.com (tooth 5 for filling)
	((SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')), 5, 'First Premolar', (SELECT id FROM tooth_status WHERE code = 'DECAYED'));
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
	-- 11. Insert Treatments (treatment_scope replaces tooth_number)
	INSERT INTO treatment (appointment_id, patient_id, staff_id, service_id, treatment_scope, notes) VALUES
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com')), (SELECT id FROM service WHERE name = 'Routine Checkup'), 'FullMouth', 'No issues found'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com')), (SELECT id FROM service WHERE name = 'Deep Cleaning'), 'FullMouth', 'Significant tartar buildup'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example.com')), (SELECT id FROM service WHERE name = 'Tooth Extraction'), 'SingleTooth', 'Impacted wisdom tooth'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example.com')), (SELECT id FROM service WHERE name = 'Braces Adjustment'), 'MultipleTeeth', 'Tightened wires'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example.com')), (SELECT id FROM service WHERE name = 'Root Canal'), 'SingleTooth', 'Severe decay'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example.com')), (SELECT id FROM service WHERE name = 'Child Cleaning'), 'FullMouth', 'Gum inflammation'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example.com')), (SELECT id FROM service WHERE name = 'Crown Fitting'), 'SingleTooth', 'Temporary crown placed'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'j.anderson@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'j.anderson@example.com')), (SELECT id FROM service WHERE name = 'Dental X-Ray'), 'FullMouth', 'Full mouth series'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'w.taylor@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'w.taylor@example.com')), (SELECT id FROM service WHERE name = 'Teeth Whitening'), 'FullMouth', 'In-office bleaching'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'amanda.t@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'amanda.t@example.com')), (SELECT id FROM service WHERE name = 'Retainer Fitting'), 'MultipleTeeth', 'New patient consultation'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com')), (SELECT id FROM service WHERE name = 'Filling'), 'SingleTooth', 'Composite filling'),
	((SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com'))), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com')), (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com')), (SELECT id FROM service WHERE name = 'Fluoride Treatment'), 'NonTooth', 'Post-cleaning fluoride');
	-- 11b. Insert Treatment-Tooth links (for SingleTooth/MultipleTeeth treatments)
	INSERT INTO treatment_tooth (treatment_id, tooth_id) VALUES
	-- Tooth Extraction: c.harris tooth 3
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Tooth Extraction')), (SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')) AND tooth_number = 3)),
	-- Root Canal: d.thompson tooth 5
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Root Canal')), (SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')) AND tooth_number = 5)),
	-- Braces Adjustment: linda.m teeth 4 and 5
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Braces Adjustment')), (SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')) AND tooth_number = 4)),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Braces Adjustment')), (SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')) AND tooth_number = 5)),
	-- Crown Fitting: sarah.j@example1 tooth 3
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Crown Fitting')), (SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')) AND tooth_number = 3)),
	-- Retainer Fitting: emily.d@example1 teeth 8 and 9
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Retainer Fitting')), (SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')) AND tooth_number = 8)),
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Retainer Fitting')), (SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')) AND tooth_number = 9)),
	-- Filling: lisa.g@example1 tooth 5
	((SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Filling')), (SELECT id FROM tooth WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')) AND tooth_number = 5));
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
	-- 14. Insert Billing Line Items (with service_id and line_item_type)
	INSERT INTO billing_line_item (billing_id, treatment_id, service_id, line_item_type, description, quantity, unit_price, discount_percentage) VALUES
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Routine Checkup')), (SELECT id FROM service WHERE name = 'Routine Checkup'), 'Service', 'Routine Checkup', 1, 150.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Deep Cleaning')), (SELECT id FROM service WHERE name = 'Deep Cleaning'), 'Service', 'Deep Cleaning', 1, 250.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Tooth Extraction')), (SELECT id FROM service WHERE name = 'Tooth Extraction'), 'Service', 'Tooth Extraction', 1, 300.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Braces Adjustment')), (SELECT id FROM service WHERE name = 'Braces Adjustment'), 'Service', 'Braces Adjustment', 1, 100.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Root Canal')), (SELECT id FROM service WHERE name = 'Root Canal'), 'Service', 'Root Canal', 1, 800.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Child Cleaning')), (SELECT id FROM service WHERE name = 'Child Cleaning'), 'Service', 'Deep Cleaning', 1, 250.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Crown Fitting')), (SELECT id FROM service WHERE name = 'Crown Fitting'), 'Service', 'Crown Fitting', 1, 1200.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Dental X-Ray')), (SELECT id FROM service WHERE name = 'Dental X-Ray'), 'Service', 'Dental X-Ray', 1, 120.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Teeth Whitening')), (SELECT id FROM service WHERE name = 'Teeth Whitening'), 'Service', 'Teeth Whitening', 1, 400.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Retainer Fitting')), (SELECT id FROM service WHERE name = 'Retainer Fitting'), 'Service', 'Consultation', 1, 150.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Filling')), (SELECT id FROM service WHERE name = 'Filling'), 'Service', 'Filling', 1, 200.00, 0.00),
	((SELECT id FROM billing WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com'))), (SELECT id FROM treatment WHERE service_id = (SELECT id FROM service WHERE name = 'Fluoride Treatment')), (SELECT id FROM service WHERE name = 'Fluoride Treatment'), 'Service', 'Fluoride Treatment', 1, 50.00, 0.00);
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
	(1, (SELECT id FROM discount_type WHERE discount_name = 'New Patient Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example1.com')), 25.00),
	(2, (SELECT id FROM discount_type WHERE discount_name = 'Family Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'linda.m@example.com')), 50.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Senior Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')), 30.00),
	(3, (SELECT id FROM discount_type WHERE discount_name = 'Student Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')), 75.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Veteran Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'rob.m@example1.com')), 20.00),
	(2, (SELECT id FROM discount_type WHERE discount_name = 'Employee Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example1.com')), 40.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Cash Payment Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')), 15.00),
	(4, (SELECT id FROM discount_type WHERE discount_name = 'Loyalty Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')), 100.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Seasonal Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'emily.d@example1.com')), 35.00),
	(2, (SELECT id FROM discount_type WHERE discount_name = 'Holiday Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example1.com')), 60.00),
	(1, (SELECT id FROM discount_type WHERE discount_name = 'Referral Discount'), (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'lisa.g@example1.com')), 25.00),
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

	-- ================================================================
	-- NOTIFICATION RELATED SEED DATA
	-- ================================================================

	-- 20. Insert Person Contact Methods
	INSERT INTO person_contact_method (person_id, channel, contact_value, is_primary, is_verified, is_active) VALUES
	-- Staff email contacts
	((SELECT id FROM person WHERE email = 'john.smith@example.com'), 'Email', 'john.smith@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'sarah.j@example.com'), 'Email', 'sarah.j@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'm.brown@example.com'), 'Email', 'm.brown@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'emily.d@example.com'), 'Email', 'emily.d@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'd.wilson@example.com'), 'Email', 'd.wilson@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'lisa.g@example.com'), 'Email', 'lisa.g@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'rob.m@example.com'), 'Email', 'rob.m@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'j.anderson@example.com'), 'Email', 'j.anderson@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'w.taylor@example.com'), 'Email', 'w.taylor@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'amanda.t@example.com'), 'Email', 'amanda.t@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'james.j@example.com'), 'Email', 'james.j@example.com', TRUE, TRUE, TRUE),
	-- Patient-only person email contacts
	((SELECT id FROM person WHERE email = 'p.white@example.com'), 'Email', 'p.white@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'c.harris@example.com'), 'Email', 'c.harris@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'linda.m@example.com'), 'Email', 'linda.m@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'd.thompson@example.com'), 'Email', 'd.thompson@example.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'john.smith@example1.com'), 'Email', 'john.smith@example1.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'sarah.j@example1.com'), 'Email', 'sarah.j@example1.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'm.brown@example1.com'), 'Email', 'm.brown@example1.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'emily.d@example1.com'), 'Email', 'emily.d@example1.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'd.wilson@example1.com'), 'Email', 'd.wilson@example1.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'lisa.g@example1.com'), 'Email', 'lisa.g@example1.com', TRUE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'rob.m@example1.com'), 'Email', 'rob.m@example1.com', TRUE, TRUE, TRUE),
	-- A few SMS contacts
	((SELECT id FROM person WHERE email = 'john.smith@example.com'), 'SMS', '+15551234567', FALSE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'james.j@example.com'), 'SMS', '+15551357913', FALSE, TRUE, TRUE),
	((SELECT id FROM person WHERE email = 'john.smith@example1.com'), 'SMS', '+15551234567', FALSE, FALSE, TRUE),
	((SELECT id FROM person WHERE email = 'sarah.j@example1.com'), 'SMS', '+15559876543', FALSE, TRUE, TRUE);

	-- 21. Insert Notification Topics
	INSERT INTO notification_topic (code, name, description, category, audience_scope) VALUES
	('APPT_CONFIRMATION', 'Appointment Confirmation', 'Sent when an appointment is booked or confirmed', 'Transactional', 'Patient'),
	('APPT_REMINDER', 'Appointment Reminder', 'Sent before an upcoming appointment', 'Transactional', 'Patient'),
	('APPT_CANCELLED', 'Appointment Cancelled', 'Sent when an appointment is cancelled', 'Transactional', 'Patient'),
	('APPT_UPDATED', 'Appointment Updated', 'Sent when appointment details change', 'Transactional', 'Patient'),
	('BILLING_INVOICE', 'Billing Invoice', 'Invoice or payment reminder sent to patient', 'Transactional', 'Patient'),
	('PROMO_SEASONAL', 'Seasonal Promotion', 'Marketing offers and seasonal deals', 'Marketing', 'Patient'),
	('STAFF_SCHEDULE', 'Staff Schedule Update', 'Schedule changes communicated to staff', 'Operational', 'Staff'),
	('WELCOME_NEW_PATIENT', 'Welcome New Patient', 'Welcome message for newly registered patients', 'Greeting', 'Patient');

	-- 22. Insert Notification Templates
	INSERT INTO notification_template (code, topic_id, channel, audience_scope, provider, subject_template, body_text, body_html, is_active) VALUES
	('APPOINTMENT_CONFIRMATION_EMAIL',
	 (SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION'),
	 'Email', 'Patient', 'AmazonSES',
	 'Your Appointment is Confirmed',
	 'Dear {{patient_name}}, your appointment on {{appointment_date}} at {{appointment_time}} with {{staff_name}} has been confirmed. Please arrive 10 minutes early.',
	 '<h2>Appointment Confirmed</h2><p>Dear {{patient_name}},</p><p>Your appointment on <strong>{{appointment_date}}</strong> at <strong>{{appointment_time}}</strong> with {{staff_name}} has been confirmed.</p><p>Please arrive 10 minutes early.</p><p>— BellaDent Dental Clinic</p>',
	 TRUE),
	('APPOINTMENT_REMINDER_EMAIL',
	 (SELECT id FROM notification_topic WHERE code = 'APPT_REMINDER'),
	 'Email', 'Patient', 'AmazonSES',
	 'Appointment Reminder - {{appointment_date}}',
	 'Hi {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}}. If you need to reschedule, please contact us.',
	 '<h2>Appointment Reminder</h2><p>Hi {{patient_name}},</p><p>This is a reminder for your upcoming appointment:</p><ul><li>Date: {{appointment_date}}</li><li>Time: {{appointment_time}}</li><li>Doctor: {{staff_name}}</li></ul><p>If you need to reschedule, please contact us.</p><p>— BellaDent Dental Clinic</p>',
	 TRUE),
	('APPOINTMENT_CANCELLED_EMAIL',
	 (SELECT id FROM notification_topic WHERE code = 'APPT_CANCELLED'),
	 'Email', 'Patient', 'AmazonSES',
	 'Appointment Cancelled',
	 'Dear {{patient_name}}, your appointment on {{appointment_date}} at {{appointment_time}} has been cancelled. Please contact us to reschedule.',
	 '<h2>Appointment Cancelled</h2><p>Dear {{patient_name}},</p><p>Your appointment on <strong>{{appointment_date}}</strong> at <strong>{{appointment_time}}</strong> has been cancelled.</p><p>Please contact us to reschedule at your convenience.</p><p>— BellaDent Dental Clinic</p>',
	 TRUE),
	('APPOINTMENT_UPDATED_EMAIL',
	 (SELECT id FROM notification_topic WHERE code = 'APPT_UPDATED'),
	 'Email', 'Patient', 'AmazonSES',
	 'Appointment Updated',
	 'Dear {{patient_name}}, your appointment has been updated. New date: {{appointment_date}} at {{appointment_time}}. Please contact us if this does not work for you.',
	 '<h2>Appointment Updated</h2><p>Dear {{patient_name}},</p><p>Your appointment has been updated:</p><ul><li>New Date: {{appointment_date}}</li><li>New Time: {{appointment_time}}</li></ul><p>Please contact us if this does not work for you.</p><p>— BellaDent Dental Clinic</p>',
	 TRUE),
	('BILLING_INVOICE_EMAIL',
	 (SELECT id FROM notification_topic WHERE code = 'BILLING_INVOICE'),
	 'Email', 'Patient', 'AmazonSES',
	 'Your Invoice from BellaDent - Rs {{total_amount}}',
	 'Dear {{patient_name}}, your invoice of Rs {{total_amount}} is due on {{due_date}}. Please contact us for payment options.',
	 '<h2>Invoice</h2><p>Dear {{patient_name}},</p><p>Your invoice details:</p><ul><li>Amount: Rs {{total_amount}}</li><li>Due Date: {{due_date}}</li></ul><p>Please contact us for payment options.</p><p>— BellaDent Dental Clinic</p>',
	 TRUE),
	('PROMO_SEASONAL_EMAIL',
	 (SELECT id FROM notification_topic WHERE code = 'PROMO_SEASONAL'),
	 'Email', 'Patient', 'AmazonSES',
	 'Special Offer from BellaDent!',
	 'Hi {{patient_name}}, we have a special offer for you! {{promo_details}}. Book your appointment today.',
	 '<h2>Special Offer!</h2><p>Hi {{patient_name}},</p><p>{{promo_details}}</p><p>Book your appointment today and take advantage of this limited-time offer.</p><p>— BellaDent Dental Clinic</p>',
	 TRUE),
	('STAFF_SCHEDULE_EMAIL',
	 (SELECT id FROM notification_topic WHERE code = 'STAFF_SCHEDULE'),
	 'Email', 'Staff', 'AmazonSES',
	 'Schedule Update - {{schedule_date}}',
	 'Hi {{staff_name}}, your schedule for {{schedule_date}} has been updated. Please check the portal for details.',
	 '<h2>Schedule Update</h2><p>Hi {{staff_name}},</p><p>Your schedule for <strong>{{schedule_date}}</strong> has been updated. Please check the portal for details.</p><p>— BellaDent Admin</p>',
	 TRUE),
	('WELCOME_NEW_PATIENT_EMAIL',
	 (SELECT id FROM notification_topic WHERE code = 'WELCOME_NEW_PATIENT'),
	 'Email', 'Patient', 'AmazonSES',
	 'Welcome to BellaDent Dental Clinic!',
	 'Dear {{patient_name}}, welcome to BellaDent! We look forward to providing you with excellent dental care. Book your first appointment today.',
	 '<h2>Welcome to BellaDent!</h2><p>Dear {{patient_name}},</p><p>Welcome to BellaDent Dental Clinic! We are delighted to have you as a patient.</p><p>We look forward to providing you with excellent dental care.</p><p>— BellaDent Dental Clinic</p>',
	 TRUE);

	-- 23. Insert Person Notification Preferences
	INSERT INTO person_notification_preference (person_id, topic_id, channel, is_enabled, opt_in_status, source) VALUES
	-- Patient james.j: transactional opt-in
	((SELECT id FROM person WHERE email = 'james.j@example.com'), (SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION'), 'Email', TRUE, 'Implicit', 'FrontDesk'),
	((SELECT id FROM person WHERE email = 'james.j@example.com'), (SELECT id FROM notification_topic WHERE code = 'APPT_REMINDER'), 'Email', TRUE, 'Implicit', 'FrontDesk'),
	((SELECT id FROM person WHERE email = 'james.j@example.com'), (SELECT id FROM notification_topic WHERE code = 'PROMO_SEASONAL'), 'Email', TRUE, 'Explicit', 'WebForm'),
	-- Patient p.white: transactional only
	((SELECT id FROM person WHERE email = 'p.white@example.com'), (SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION'), 'Email', TRUE, 'Implicit', 'FrontDesk'),
	((SELECT id FROM person WHERE email = 'p.white@example.com'), (SELECT id FROM notification_topic WHERE code = 'BILLING_INVOICE'), 'Email', TRUE, 'Implicit', 'FrontDesk'),
	-- Patient c.harris: opted out of marketing
	((SELECT id FROM person WHERE email = 'c.harris@example.com'), (SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION'), 'Email', TRUE, 'Implicit', 'FrontDesk'),
	((SELECT id FROM person WHERE email = 'c.harris@example.com'), (SELECT id FROM notification_topic WHERE code = 'PROMO_SEASONAL'), 'Email', FALSE, 'OptedOut', 'AdminPanel'),
	-- Patient john.smith@example1: all enabled
	((SELECT id FROM person WHERE email = 'john.smith@example1.com'), (SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION'), 'Email', TRUE, 'Implicit', 'FrontDesk'),
	((SELECT id FROM person WHERE email = 'john.smith@example1.com'), (SELECT id FROM notification_topic WHERE code = 'PROMO_SEASONAL'), 'Email', TRUE, 'Explicit', 'WebForm'),
	-- Staff john.smith: operational
	((SELECT id FROM person WHERE email = 'john.smith@example.com'), (SELECT id FROM notification_topic WHERE code = 'STAFF_SCHEDULE'), 'Email', TRUE, 'Implicit', 'AdminPanel');

	-- 24. Insert Notification Campaigns
	INSERT INTO notification_campaign (name, topic_id, template_id, channel, audience_scope, status, launched_at, completed_at, description) VALUES
	('Spring Cleaning Special 2023',
	 (SELECT id FROM notification_topic WHERE code = 'PROMO_SEASONAL'),
	 (SELECT id FROM notification_template WHERE code = 'PROMO_SEASONAL_EMAIL'),
	 'Email', 'Patient', 'Completed', '2023-09-15 10:00:00', '2023-09-15 10:05:00',
	 'Spring promotion offering 20% off dental cleanings'),
	('New Year Whitening Offer 2024',
	 (SELECT id FROM notification_topic WHERE code = 'PROMO_SEASONAL'),
	 (SELECT id FROM notification_template WHERE code = 'PROMO_SEASONAL_EMAIL'),
	 'Email', 'Patient', 'Draft', NULL, NULL,
	 'New year promotion for teeth whitening services');

	-- 25. Insert Notifications
	INSERT INTO notification (topic_id, template_id, campaign_id, appointment_id, patient_id, channel, provider, status, subject_rendered, body_rendered_text, body_rendered_html, processed_at) VALUES
	-- Appointment confirmation for james.j (Sent)
	((SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION'),
	 (SELECT id FROM notification_template WHERE code = 'APPOINTMENT_CONFIRMATION_EMAIL'),
	 NULL,
	 (SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example.com'))),
	 (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')),
	 'Email', 'AmazonSES', 'Sent',
	 'Your Appointment is Confirmed',
	 'Dear James Jackson, your appointment on Oct 1, 2023 at 9:00 AM with Dr. John Smith has been confirmed.',
	 '<h2>Appointment Confirmed</h2><p>Dear James Jackson,</p><p>Your appointment on <strong>Oct 1, 2023</strong> at <strong>9:00 AM</strong> with Dr. John Smith has been confirmed.</p>',
	 '2023-09-30 08:00:00'),
	-- Appointment confirmation for p.white (Sent)
	((SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION'),
	 (SELECT id FROM notification_template WHERE code = 'APPOINTMENT_CONFIRMATION_EMAIL'),
	 NULL,
	 (SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'sarah.j@example.com'))),
	 (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com')),
	 'Email', 'AmazonSES', 'Sent',
	 'Your Appointment is Confirmed',
	 'Dear Patricia White, your appointment on Oct 1, 2023 at 10:00 AM with Sarah Johnson has been confirmed.',
	 '<h2>Appointment Confirmed</h2><p>Dear Patricia White,</p><p>Your appointment on <strong>Oct 1, 2023</strong> at <strong>10:00 AM</strong> with Sarah Johnson has been confirmed.</p>',
	 '2023-09-30 08:01:00'),
	-- Appointment confirmation for c.harris (Sent)
	((SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION'),
	 (SELECT id FROM notification_template WHERE code = 'APPOINTMENT_CONFIRMATION_EMAIL'),
	 NULL,
	 (SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'm.brown@example.com'))),
	 (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com')),
	 'Email', 'AmazonSES', 'Sent',
	 'Your Appointment is Confirmed',
	 'Dear Christopher Harris, your appointment on Oct 1, 2023 at 11:00 AM with Dr. Michael Brown has been confirmed.',
	 '<h2>Appointment Confirmed</h2><p>Dear Christopher Harris,</p><p>Your appointment on <strong>Oct 1, 2023</strong> at <strong>11:00 AM</strong> with Dr. Michael Brown has been confirmed.</p>',
	 '2023-09-30 08:02:00'),
	-- Appointment cancelled for d.thompson (Failed)
	((SELECT id FROM notification_topic WHERE code = 'APPT_CANCELLED'),
	 (SELECT id FROM notification_template WHERE code = 'APPOINTMENT_CANCELLED_EMAIL'),
	 NULL,
	 (SELECT id FROM appointment WHERE patient_id = (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')) AND staff_id = (SELECT id FROM staff WHERE person_id = (SELECT id FROM person WHERE email = 'd.wilson@example.com'))),
	 (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com')),
	 'Email', 'AmazonSES', 'Failed',
	 'Appointment Cancelled',
	 'Dear Daniel Thompson, your appointment on Oct 1, 2023 at 2:00 PM has been cancelled.',
	 '<h2>Appointment Cancelled</h2><p>Dear Daniel Thompson,</p><p>Your appointment on <strong>Oct 1, 2023</strong> at <strong>2:00 PM</strong> has been cancelled.</p>',
	 '2023-10-01 12:00:00'),
	-- Campaign: Spring Cleaning promo for james.j (Sent)
	((SELECT id FROM notification_topic WHERE code = 'PROMO_SEASONAL'),
	 (SELECT id FROM notification_template WHERE code = 'PROMO_SEASONAL_EMAIL'),
	 (SELECT id FROM notification_campaign WHERE name = 'Spring Cleaning Special 2023'),
	 NULL,
	 (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com')),
	 'Email', 'AmazonSES', 'Sent',
	 'Special Offer from BellaDent!',
	 'Hi James, we have a special offer for you! Get 20% off your next dental cleaning. Book your appointment today.',
	 '<h2>Special Offer!</h2><p>Hi James,</p><p>Get 20% off your next dental cleaning!</p><p>Book your appointment today.</p>',
	 '2023-09-15 10:01:00'),
	-- Campaign: Spring Cleaning promo for john.smith@example1 (Sent)
	((SELECT id FROM notification_topic WHERE code = 'PROMO_SEASONAL'),
	 (SELECT id FROM notification_template WHERE code = 'PROMO_SEASONAL_EMAIL'),
	 (SELECT id FROM notification_campaign WHERE name = 'Spring Cleaning Special 2023'),
	 NULL,
	 (SELECT id FROM patient WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com')),
	 'Email', 'AmazonSES', 'Sent',
	 'Special Offer from BellaDent!',
	 'Hi John, we have a special offer for you! Get 20% off your next dental cleaning. Book your appointment today.',
	 '<h2>Special Offer!</h2><p>Hi John,</p><p>Get 20% off your next dental cleaning!</p><p>Book your appointment today.</p>',
	 '2023-09-15 10:02:00');

	-- 26. Insert Notification Recipients
	INSERT INTO notification_recipient (notification_id, person_id, contact_method_id, recipient_address, delivery_status, provider_message_id, sent_at, delivered_at, opened_at, failed_at, failure_reason) VALUES
	-- james.j appointment confirmation → Delivered + Opened
	((SELECT n.id FROM notification n JOIN patient p ON n.patient_id = p.id JOIN person pe ON p.person_id = pe.id WHERE pe.email = 'james.j@example.com' AND n.status = 'Sent' AND n.topic_id = (SELECT id FROM notification_topic WHERE code = 'APPT_CONFIRMATION') LIMIT 1),
	 (SELECT id FROM person WHERE email = 'james.j@example.com'),
	 (SELECT id FROM person_contact_method WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com') AND channel = 'Email' LIMIT 1),
	 'james.j@example.com', 'Opened', 'ses-msg-001', '2023-09-30 08:00:01', '2023-09-30 08:00:03', '2023-09-30 09:15:00', NULL, NULL),
	-- p.white appointment confirmation → Delivered
	((SELECT n.id FROM notification n JOIN patient p ON n.patient_id = p.id JOIN person pe ON p.person_id = pe.id WHERE pe.email = 'p.white@example.com' AND n.status = 'Sent' LIMIT 1),
	 (SELECT id FROM person WHERE email = 'p.white@example.com'),
	 (SELECT id FROM person_contact_method WHERE person_id = (SELECT id FROM person WHERE email = 'p.white@example.com') AND channel = 'Email' LIMIT 1),
	 'p.white@example.com', 'Delivered', 'ses-msg-002', '2023-09-30 08:01:01', '2023-09-30 08:01:04', NULL, NULL, NULL),
	-- c.harris appointment confirmation → Delivered
	((SELECT n.id FROM notification n JOIN patient p ON n.patient_id = p.id JOIN person pe ON p.person_id = pe.id WHERE pe.email = 'c.harris@example.com' AND n.status = 'Sent' LIMIT 1),
	 (SELECT id FROM person WHERE email = 'c.harris@example.com'),
	 (SELECT id FROM person_contact_method WHERE person_id = (SELECT id FROM person WHERE email = 'c.harris@example.com') AND channel = 'Email' LIMIT 1),
	 'c.harris@example.com', 'Delivered', 'ses-msg-003', '2023-09-30 08:02:01', '2023-09-30 08:02:05', NULL, NULL, NULL),
	-- d.thompson appointment cancelled → Failed (bounce)
	((SELECT n.id FROM notification n JOIN patient p ON n.patient_id = p.id JOIN person pe ON p.person_id = pe.id WHERE pe.email = 'd.thompson@example.com' AND n.status = 'Failed' LIMIT 1),
	 (SELECT id FROM person WHERE email = 'd.thompson@example.com'),
	 (SELECT id FROM person_contact_method WHERE person_id = (SELECT id FROM person WHERE email = 'd.thompson@example.com') AND channel = 'Email' LIMIT 1),
	 'd.thompson@example.com', 'Bounced', NULL, '2023-10-01 12:00:01', NULL, NULL, '2023-10-01 12:00:05', 'Mailbox full — hard bounce'),
	-- james.j campaign promo → Delivered
	((SELECT n.id FROM notification n JOIN patient p ON n.patient_id = p.id JOIN person pe ON p.person_id = pe.id WHERE pe.email = 'james.j@example.com' AND n.campaign_id IS NOT NULL LIMIT 1),
	 (SELECT id FROM person WHERE email = 'james.j@example.com'),
	 (SELECT id FROM person_contact_method WHERE person_id = (SELECT id FROM person WHERE email = 'james.j@example.com') AND channel = 'Email' LIMIT 1),
	 'james.j@example.com', 'Delivered', 'ses-msg-005', '2023-09-15 10:01:01', '2023-09-15 10:01:04', NULL, NULL, NULL),
	-- john.smith@example1 campaign promo → Clicked
	((SELECT n.id FROM notification n JOIN patient p ON n.patient_id = p.id JOIN person pe ON p.person_id = pe.id WHERE pe.email = 'john.smith@example1.com' AND n.campaign_id IS NOT NULL LIMIT 1),
	 (SELECT id FROM person WHERE email = 'john.smith@example1.com'),
	 (SELECT id FROM person_contact_method WHERE person_id = (SELECT id FROM person WHERE email = 'john.smith@example1.com') AND channel = 'Email' LIMIT 1),
	 'john.smith@example1.com', 'Clicked', 'ses-msg-006', '2023-09-15 10:02:01', '2023-09-15 10:02:04', '2023-09-15 11:30:00', NULL, NULL);

	-- 27. Insert Notification Provider Events
	INSERT INTO notification_provider_event (notification_recipient_id, provider, event_type, event_time, payload) VALUES
	-- james.j appt confirmation: Send → Delivery → Open
	((SELECT id FROM notification_recipient WHERE recipient_address = 'james.j@example.com' AND provider_message_id = 'ses-msg-001'),
	 'AmazonSES', 'Send', '2023-09-30 08:00:01', '{"messageId": "ses-msg-001"}'),
	((SELECT id FROM notification_recipient WHERE recipient_address = 'james.j@example.com' AND provider_message_id = 'ses-msg-001'),
	 'AmazonSES', 'Delivery', '2023-09-30 08:00:03', '{"messageId": "ses-msg-001", "smtpResponse": "250 OK"}'),
	((SELECT id FROM notification_recipient WHERE recipient_address = 'james.j@example.com' AND provider_message_id = 'ses-msg-001'),
	 'AmazonSES', 'Open', '2023-09-30 09:15:00', '{"messageId": "ses-msg-001", "ipAddress": "192.168.1.1"}'),
	-- d.thompson: Send → Bounce
	((SELECT id FROM notification_recipient WHERE recipient_address = 'd.thompson@example.com' AND delivery_status = 'Bounced'),
	 'AmazonSES', 'Send', '2023-10-01 12:00:01', '{"messageId": "ses-msg-004-attempt"}'),
	((SELECT id FROM notification_recipient WHERE recipient_address = 'd.thompson@example.com' AND delivery_status = 'Bounced'),
	 'AmazonSES', 'Bounce', '2023-10-01 12:00:05', '{"bounceType": "Permanent", "bounceSubType": "MailboxFull"}'),
	-- john.smith@example1 campaign: Send → Delivery → Open → Click
	((SELECT id FROM notification_recipient WHERE recipient_address = 'john.smith@example1.com' AND provider_message_id = 'ses-msg-006'),
	 'AmazonSES', 'Send', '2023-09-15 10:02:01', '{"messageId": "ses-msg-006"}'),
	((SELECT id FROM notification_recipient WHERE recipient_address = 'john.smith@example1.com' AND provider_message_id = 'ses-msg-006'),
	 'AmazonSES', 'Delivery', '2023-09-15 10:02:04', '{"messageId": "ses-msg-006", "smtpResponse": "250 OK"}'),
	((SELECT id FROM notification_recipient WHERE recipient_address = 'john.smith@example1.com' AND provider_message_id = 'ses-msg-006'),
	 'AmazonSES', 'Open', '2023-09-15 11:30:00', '{"messageId": "ses-msg-006"}'),
	((SELECT id FROM notification_recipient WHERE recipient_address = 'john.smith@example1.com' AND provider_message_id = 'ses-msg-006'),
	 'AmazonSES', 'Click', '2023-09-15 11:31:00', '{"messageId": "ses-msg-006", "link": "https://belladentclinic.com/book"}');

	-- 28. Insert Person Channel Suppressions
	INSERT INTO person_channel_suppression (person_id, channel, contact_value, reason, is_active) VALUES
	((SELECT id FROM person WHERE email = 'rob.m@example1.com'), 'Email', 'rob.m@example1.com', 'Hard bounce detected by SES', TRUE),
	((SELECT id FROM person WHERE email = 'd.wilson@example1.com'), 'SMS', '+15555556666', 'User requested SMS opt-out', FALSE);
