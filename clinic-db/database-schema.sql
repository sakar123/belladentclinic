-- ================================================================
-- clinic_db schema (TEXT instead of ENUM types)
-- ================================================================

--CREATE DATABASE clinic_db;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- LOOKUP TABLES
-- ================================================================

CREATE TABLE role (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE specialty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ================================================================
-- CORE TABLES
-- ================================================================

CREATE TABLE person (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,

    -- TEXT instead of GENDER_ENUM
    gender TEXT,
    CONSTRAINT chk_person_gender
      CHECK (gender IS NULL OR gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),

    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    address VARCHAR(500),
    a_identifier TEXT,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- single staff table replaces Doctors/Hygienist/Admin
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID UNIQUE NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES role(id),
    specialty_id UUID REFERENCES specialty(id),
    license_number VARCHAR(50) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID UNIQUE NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- ================================================================
-- TOOTH RELATED
-- ================================================================

CREATE TABLE tooth_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(25) UNIQUE NOT NULL,
  description VARCHAR(200),

  -- Auditing
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tooth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patient(id),
  tooth_number INT NOT NULL,
  tooth_name VARCHAR(50) NOT NULL,
  tooth_status_id UUID NOT NULL REFERENCES tooth_status(id),

  UNIQUE (patient_id, tooth_number),

  -- Auditing
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- APPOINTMENT & CLINICAL TABLES
-- ================================================================

CREATE TABLE appointment_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE appointment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id),
    staff_id UUID NOT NULL REFERENCES staff(id),
    status_id UUID NOT NULL REFERENCES appointment_status(id),
    appointment_start_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    reason_for_visit TEXT,
    notes TEXT,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE TABLE service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialty_id UUID REFERENCES specialty(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cost NUMERIC(10, 2) NOT NULL CHECK (cost >= 0)
);

CREATE TABLE treatment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointment(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    staff_id UUID NOT NULL REFERENCES staff(id),
    service_id UUID NOT NULL REFERENCES service(id),
    treatment_scope TEXT NOT NULL,
    CONSTRAINT chk_treatment_scope
      CHECK (treatment_scope IN ('NonTooth', 'SingleTooth', 'MultipleTeeth', 'FullMouth')),
    notes TEXT,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);
CREATE TABLE prescription (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_id UUID NOT NULL REFERENCES treatment(id),
    drug_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(100),
    instructions TEXT,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);
CREATE TABLE treatment_tooth (
    treatment_id UUID NOT NULL REFERENCES treatment(id) ON DELETE CASCADE,
    tooth_id UUID NOT NULL REFERENCES tooth(id),
    PRIMARY KEY (treatment_id, tooth_id)
);
-- ================================================================
-- SERVICE SCOPE SUPPORT
-- ================================================================

CREATE TABLE service_tooth_scope (
    service_id UUID NOT NULL REFERENCES service(id) ON DELETE CASCADE,
    tooth_scope TEXT NOT NULL,
    CONSTRAINT chk_service_tooth_scope
      CHECK (tooth_scope IN ('NonTooth', 'SingleTooth', 'MultipleTeeth', 'FullMouth')),
    PRIMARY KEY (service_id, tooth_scope)
);

-- ================================================================
-- BILLING & PAYMENT TABLES (TEXT instead of ENUM)
-- ================================================================

CREATE TABLE billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

    -- TEXT instead of BILL_STATUS_ENUM
    status TEXT NOT NULL DEFAULT 'Draft',
    CONSTRAINT chk_billing_status
      CHECK (status IN ('Draft', 'Open', 'Paid', 'Partial', 'Void')),

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE TABLE billing_line_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    billing_id UUID NOT NULL REFERENCES billing(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatment(id) ON DELETE SET NULL,
    service_id UUID REFERENCES service(id),
    line_item_type TEXT NOT NULL DEFAULT 'Service',
    CONSTRAINT chk_billing_line_item_type
      CHECK (line_item_type IN ('Service', 'Product', 'Lab', 'Adjustment', 'Other')),
    CONSTRAINT chk_billing_line_item_service_rules
      CHECK (
        (line_item_type = 'Service' AND service_id IS NOT NULL AND treatment_id IS NOT NULL)
        OR
        (line_item_type <> 'Service' AND service_id IS NULL AND treatment_id IS NULL)
      ),
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00
      CHECK (discount_percentage >= 0 AND discount_percentage <= 100),

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE TABLE discount_type (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_name VARCHAR(50) UNIQUE NOT NULL,
  discount_percentage NUMERIC(5,2) NOT NULL,

  -- Auditing
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

CREATE TABLE sale_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantity INT NOT NULL,
  discount_id UUID REFERENCES discount_type(id),
  patient_id UUID REFERENCES patient(id),
  cost NUMERIC(10,2) NOT NULL,

  -- Auditing
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

CREATE TABLE payment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    billing_id UUID NOT NULL REFERENCES billing(id),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- TEXT instead of PAYMENT_METHOD_ENUM
    method TEXT NOT NULL,
    CONSTRAINT chk_payment_method
      CHECK (method IN ('Cash', 'Credit Card', 'Insurance', 'Bank Transfer', 'Mobile-Pay')),

    transaction_ref VARCHAR(255),

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL
);

-- ================================================================
-- DOCUMENT RELATED
-- ================================================================

CREATE TABLE document_type (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type VARCHAR(25) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(200)
);

CREATE TABLE document (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tooth_id UUID REFERENCES tooth(id),
  treatment_id UUID,
  patient_id UUID NOT NULL REFERENCES patient(id),
  document_type_id UUID NOT NULL REFERENCES document_type(id),
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description VARCHAR(500) NOT NULL,
  is_sensitive BOOLEAN DEFAULT FALSE,
  document_path VARCHAR(500) NOT NULL,

  -- Auditing
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES
-- ================================================================

-- person table
CREATE INDEX idx_persons_last_first_name ON person (last_name, first_name);
CREATE INDEX idx_persons_email ON person (email);

-- staff table
CREATE INDEX idx_staff_person_id ON staff (person_id);
CREATE INDEX idx_staff_role_id ON staff (role_id);
CREATE INDEX idx_staff_specialty_id ON staff (specialty_id);

-- patient table
CREATE INDEX idx_patients_person_id ON patient (person_id);

-- appointment table
CREATE INDEX idx_appointments_patient_id ON appointment (patient_id);
CREATE INDEX idx_appointments_staff_id ON appointment (staff_id);
CREATE INDEX idx_appointments_status_id ON appointment (status_id);
CREATE INDEX idx_appointments_start_time ON appointment (appointment_start_time);

-- treatment table
CREATE INDEX idx_treatments_appointment_id ON treatment (appointment_id);
CREATE INDEX idx_treatments_patient_id ON treatment (patient_id);
CREATE INDEX idx_treatments_staff_id ON treatment (staff_id);
CREATE INDEX idx_treatments_service_id ON treatment (service_id);

-- prescription table
CREATE INDEX idx_prescriptions_treatment_id ON prescription (treatment_id);

-- billing table
CREATE INDEX idx_billings_patient_id ON billing (patient_id);
CREATE INDEX idx_billings_status ON billing (status);

-- billing_line_item table
CREATE INDEX idx_billing_line_items_billing_id ON billing_line_item (billing_id);
CREATE INDEX idx_billing_line_items_treatment_id ON billing_line_item (treatment_id);
CREATE INDEX idx_billing_line_items_service_id ON billing_line_item (service_id);
CREATE INDEX idx_billing_line_items_line_item_type ON billing_line_item (line_item_type);
-- payment table
CREATE INDEX idx_payments_billing_id ON payment (billing_id);

--treatment_tooth table
CREATE INDEX idx_treatment_tooth_treatment_id
    ON treatment_tooth (treatment_id);

CREATE INDEX idx_treatment_tooth_tooth_id
    ON treatment_tooth (tooth_id);
-- ================================================================
-- TRIGGERS: updated_at auto-update
-- ================================================================

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables that have updated_at
CREATE TRIGGER set_timestamp_persons
BEFORE UPDATE ON person
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_staff
BEFORE UPDATE ON staff
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_patients
BEFORE UPDATE ON patient
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_appointments
BEFORE UPDATE ON appointment
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_treatments
BEFORE UPDATE ON treatment
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_prescriptions
BEFORE UPDATE ON prescription
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_billings
BEFORE UPDATE ON billing
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tooth_status
BEFORE UPDATE ON tooth_status
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tooth
BEFORE UPDATE ON tooth
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_discount_type
BEFORE UPDATE ON discount_type
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_sale_item
BEFORE UPDATE ON sale_item
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_document
BEFORE UPDATE ON document
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
