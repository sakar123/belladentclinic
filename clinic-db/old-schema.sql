	-- Create tables in proper dependency order
	CREATE TABLE `Person` (
	  `person_id` int PRIMARY KEY AUTO_INCREMENT,
	  `first_name` varchar(50) NOT NULL,
	  `last_name` varchar(50) NOT NULL,
	  `gender` char(25),
	  `dateOfBirth` date,
	  `SS_identifier` varchar(50) UNIQUE,
	  `address` varchar(500),
	  `email` varchar(100) UNIQUE,
	  `PhoneNumber` varchar(50)
	);
	CREATE TABLE `Roles` (
	  `role_id` int PRIMARY KEY AUTO_INCREMENT,
	  `name` varchar(50) UNIQUE NOT NULL,
	  `description` varchar(200)
	);
	CREATE TABLE `Speciality` (
	  `speciality_id` int PRIMARY KEY AUTO_INCREMENT,
	  `speciality_name` varchar(50) UNIQUE NOT NULL,
	  `description` varchar(200)
	);
	CREATE TABLE `Document_Types` (
	  `document_type_id` int PRIMARY KEY AUTO_INCREMENT,
	  `document_type` varchar(25) UNIQUE NOT NULL,
	  `name` varchar(50) NOT NULL,
	  `description` varchar(200)
	);
	CREATE TABLE `Tooth_Status` (
	  `tooth_status_id` int PRIMARY KEY AUTO_INCREMENT,
	  `code` varchar(25) UNIQUE NOT NULL,
	  `description` varchar(200)
	);
	CREATE TABLE `Appointment_Status` (
	  `appointment_status_id` int PRIMARY KEY AUTO_INCREMENT,
	  `app_status_name` varchar(25) UNIQUE NOT NULL
	);
	CREATE TABLE `Discount_Type` (
	  `discount_id` int PRIMARY KEY AUTO_INCREMENT,
	  `discount_name` varchar(50) UNIQUE NOT NULL,
	  `discount_percentage` decimal(5,2) NOT NULL
	);
	-- Child tables with proper foreign keys to Person
	CREATE TABLE `Patient` (
	  `patient_id` int PRIMARY KEY AUTO_INCREMENT,
	  `person_id` int UNIQUE NOT NULL,
	  `emergency_contact_name` varchar(50) NOT NULL,
	  `emergency_contact_phone` varchar(50) NOT NULL,
	  FOREIGN KEY (`person_id`) REFERENCES `Person` (`person_id`)
	);
	CREATE TABLE `Doctors` (
	  `doctor_id` int PRIMARY KEY AUTO_INCREMENT,
	  `person_id` int UNIQUE NOT NULL,
	  `speciality_id` int,
	  `license_number` varchar(50) UNIQUE NOT NULL,
	  FOREIGN KEY (`person_id`) REFERENCES `Person` (`person_id`),
	  FOREIGN KEY (`speciality_id`) REFERENCES `Speciality` (`speciality_id`)
	);
	CREATE TABLE `Hygienist` (
	  `hygienist_id` int PRIMARY KEY AUTO_INCREMENT,
	  `person_id` int UNIQUE NOT NULL,
	  `license_number` varchar(50) UNIQUE NOT NULL,
	  `speciality_id` int,
	  FOREIGN KEY (`person_id`) REFERENCES `Person` (`person_id`),
	  FOREIGN KEY (`speciality_id`) REFERENCES `Speciality` (`speciality_id`)
	);
	CREATE TABLE `Administrator` (
	  `administrator_id` int PRIMARY KEY AUTO_INCREMENT,
	  `person_id` int UNIQUE NOT NULL,
	  `role_id` int NOT NULL,
	  FOREIGN KEY (`person_id`) REFERENCES `Person` (`person_id`),
	  FOREIGN KEY (`role_id`) REFERENCES `Roles` (`role_id`)
	);
	-- Remaining tables with proper foreign keys
	CREATE TABLE `Tooth` (
	  `tooth_id` int PRIMARY KEY AUTO_INCREMENT,
	  `patient_id` int NOT NULL,
	  `tooth_number` int NOT NULL,
	  `tooth_name` varchar(50) NOT NULL,
	  `tooth_status_id` int NOT NULL,
	  FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`),
	  FOREIGN KEY (`tooth_status_id`) REFERENCES `Tooth_Status` (`tooth_status_id`),
	  UNIQUE KEY `unique_patient_tooth` (`patient_id`, `tooth_number`)
	);
	CREATE TABLE `Service` (
	  `service_id` int PRIMARY KEY AUTO_INCREMENT,
	  `speciality_id` int,
	  `service_name` varchar(50) NOT NULL,
	  `description` varchar(200),
	  `cost` decimal(10,2) NOT NULL,
	  FOREIGN KEY (`speciality_id`) REFERENCES `Speciality` (`speciality_id`)
	);
	CREATE TABLE `Appointment` (
	  `appointment_id` int PRIMARY KEY AUTO_INCREMENT,
	  `patient_id` int NOT NULL,
	  `doctor_id` int,
	  `hygienist_id` int,
	  `appt_status_id` int NOT NULL,
	  `date_when_appointment_was_made` datetime NOT NULL,
	  `appointment_date` datetime NOT NULL,
	  `duration` int NOT NULL COMMENT 'Duration in minutes',
	  `reason_for_visit` varchar(500),
	  `notes` varchar(500),
	  FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`),
	  FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`doctor_id`),
	  FOREIGN KEY (`hygienist_id`) REFERENCES `Hygienist` (`hygienist_id`),
	  FOREIGN KEY (`appt_status_id`) REFERENCES `Appointment_Status` (`appointment_status_id`)
	);
	CREATE TABLE `Treatment` (
	  `treatment_id` int PRIMARY KEY AUTO_INCREMENT,
	  `appointment_id` int NOT NULL,
	  `doctor_id` int NOT NULL,
	  `patient_id` int NOT NULL,
	  `hygienist_id` int NOT NULL,
	  `service_id` int NOT NULL,
	  `prescription_id` int NOT NULL,
	  `tooth_id` int NOT NULL,
	  `discount_id` int NOT NULL,
	  `notes` varchar(500),
	  FOREIGN KEY (`appointment_id`) REFERENCES `Appointment` (`appointment_id`),
	  FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`doctor_id`),
	  FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`),
	  FOREIGN KEY (`hygienist_id`) REFERENCES `Hygienist` (`hygienist_id`),
	  FOREIGN KEY (`service_id`) REFERENCES `Service` (`service_id`),
	  FOREIGN KEY (`tooth_id`) REFERENCES `Tooth` (`tooth_id`),
	  FOREIGN KEY (`discount_id`) REFERENCES `Discount_Type` (`discount_id`)
	);
	CREATE TABLE `Prescription` (
	  `prescription_id` int PRIMARY KEY AUTO_INCREMENT,
	  `treatment_id` int NOT NULL,
	  `drug_name` varchar(50) NOT NULL,
	  `drug_description` varchar(200),
	  `drug_type` varchar(25) NOT NULL,
	  `cost` decimal(10,2) NOT NULL,
	  FOREIGN KEY (`treatment_id`) REFERENCES `Treatment` (`treatment_id`)
	);
	CREATE TABLE `Document` (
	  `document_id` int PRIMARY KEY AUTO_INCREMENT,
	  `tooth_id` int,
	  `treatment_id` int,
	  `patient_id` int NOT NULL,
	  `document_type_id` int NOT NULL,
	  `upload_date` date NOT NULL DEFAULT (CURRENT_DATE),
	  `description` varchar(500) NOT NULL,
	  `is_sensitive` boolean DEFAULT false,
	  `document_path` varchar(500) NOT NULL,
	  FOREIGN KEY (`tooth_id`) REFERENCES `Tooth` (`tooth_id`),
	  FOREIGN KEY (`treatment_id`) REFERENCES `Treatment` (`treatment_id`),
	  FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`),
	  FOREIGN KEY (`document_type_id`) REFERENCES `Document_Types` (`document_type_id`)
	);
	CREATE TABLE `Sale_Item` (
	  `sale_item_id` int PRIMARY KEY AUTO_INCREMENT,
	  `quantity` int NOT NULL,
	  `discount_id` int,
	  `patient_id` int,
	  `cost` int NOT NULL,
	  FOREIGN KEY (`discount_id`) REFERENCES `Discount_Type` (`discount_id`),
	  FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`)
	);
	CREATE TABLE `Billing` (
	  `bill_id` int PRIMARY KEY AUTO_INCREMENT,
	  `patient_id` int NOT NULL,
	  `amount_due` decimal(10,2) NOT NULL,
	  `treatment_id` int,
	  `sale_item_id` int,
	  `bill_status` varchar(25) NOT NULL COMMENT 'Refers to Enum bill_status',
	  FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`),
	  FOREIGN KEY (`treatment_id`) REFERENCES `Treatment` (`treatment_id`),
	  FOREIGN KEY (`sale_item_id`) REFERENCES `Sale_Item` (`sale_item_id`)
	);
	CREATE TABLE `Payment` (
	  `payment_id` int PRIMARY KEY AUTO_INCREMENT,
	  `bill_id` int NOT NULL,
	  `amount` decimal(10,2) NOT NULL,
	  `method` varchar(50) NOT NULL,
	  `paid` boolean NOT NULL,
	  FOREIGN KEY (`bill_id`) REFERENCES `Billing` (`bill_id`)
	);
