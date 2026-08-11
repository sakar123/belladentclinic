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
  color VARCHAR(7),

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

CREATE TABLE patient_odontogram_snapshot (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL UNIQUE REFERENCES patient(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  source_version VARCHAR(50) NOT NULL DEFAULT 'react-advanced-odontogram',

  -- Auditing
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

CREATE TABLE odontogram_tooth_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  tooth_id UUID NULL REFERENCES tooth(id) ON DELETE SET NULL,
  backend_tooth_number INT NOT NULL,
  advanced_tooth_number INT NOT NULL,
  chart_kind VARCHAR(20) NOT NULL,
  state_json JSONB NOT NULL,
  state_hash VARCHAR(128) NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50),
  UNIQUE(patient_id, chart_kind, backend_tooth_number)
);

CREATE TABLE odontogram_audit_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  event_type VARCHAR(80) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50)
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
    cost NUMERIC(10, 2) NOT NULL CHECK (cost >= 0),
    resulting_tooth_status_id UUID REFERENCES tooth_status(id),
    visual_cue_code VARCHAR(30)
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
    status TEXT NOT NULL DEFAULT 'Planned',
    CONSTRAINT chk_treatment_status
      CHECK (status IN ('Planned', 'InProgress', 'Completed', 'Cancelled')),
    completed_at TIMESTAMPTZ,
    notes TEXT,
    surfaces VARCHAR(10),

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- Optional per-tooth surface links for treatments (for advanced surface tracking)
CREATE TABLE treatmenttoothsurface (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_id UUID NOT NULL REFERENCES treatment(id) ON DELETE CASCADE,
    tooth_id UUID NOT NULL REFERENCES tooth(id) ON DELETE CASCADE,
    surface VARCHAR(10) NOT NULL
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

CREATE TABLE odontogram_plan_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  appointment_id UUID NULL REFERENCES appointment(id) ON DELETE SET NULL,
  treatment_id UUID NULL REFERENCES treatment(id) ON DELETE SET NULL,
  backend_tooth_number INT NULL,
  advanced_tooth_number INT NULL,
  axis VARCHAR(80) NOT NULL,
  from_json JSONB NULL,
  to_json JSONB NOT NULL,
  proposed_service_id UUID NULL REFERENCES service(id) ON DELETE SET NULL,
  proposed_surfaces VARCHAR(20) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
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

-- Surface pricing tiers for surface-based services (e.g., fillings)
CREATE TABLE surface_pricing_tier (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES service(id) ON DELETE CASCADE,
    min_surfaces INTEGER NOT NULL,
    max_surfaces INTEGER NOT NULL,
    multiplier DECIMAL(5,2) NOT NULL
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

    -- Free-form billing notes
    notes TEXT,

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
    notes TEXT,

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
-- PERIODONTAL TABLES
-- ================================================================

CREATE TABLE periostatus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    examination_date TIMESTAMPTZ NOT NULL,
    smoker BOOLEAN NOT NULL DEFAULT FALSE,
    bone_loss INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE periomeasurement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    perio_status_id UUID NOT NULL REFERENCES periostatus(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL,
    site_index INTEGER NOT NULL CHECK (site_index BETWEEN 0 AND 5),
    pocket_depth INTEGER NOT NULL DEFAULT 0,
    clinical_attachment_level INTEGER NOT NULL DEFAULT 0,
    gingival_margin INTEGER NOT NULL DEFAULT 0,
    bleeding_on_probing BOOLEAN NOT NULL DEFAULT FALSE,
    recession INTEGER NOT NULL DEFAULT 0,
    mobility INTEGER NOT NULL DEFAULT 0,
    furcation INTEGER NOT NULL DEFAULT 0
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
-- surface_pricing_tier table
CREATE INDEX idx_surface_pricing_tier_service_id ON surface_pricing_tier (service_id);
-- payment table
CREATE INDEX idx_payments_billing_id ON payment (billing_id);

--treatment_tooth table
CREATE INDEX idx_treatment_tooth_treatment_id
    ON treatment_tooth (treatment_id);

CREATE INDEX idx_treatment_tooth_tooth_id
    ON treatment_tooth (tooth_id);

-- treatmenttoothsurface indexes
CREATE INDEX idx_treatmenttoothsurface_treatment_id ON treatmenttoothsurface (treatment_id);
CREATE INDEX idx_treatmenttoothsurface_tooth_id ON treatmenttoothsurface (tooth_id);

-- perio indexes
CREATE INDEX idx_periostatus_patient_id ON periostatus (patient_id);
CREATE INDEX idx_periostatus_staff_id ON periostatus (staff_id);
CREATE INDEX idx_periomeasurement_perio_status_id ON periomeasurement (perio_status_id);
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



-- ================================================================
-- NOTIFICATION RELATED
-- ================================================================



-- ================================================================
-- PERSON CONTACT METHOD
-- lets a person have multiple emails later if needed
-- lets you add phone numbers later for SMS
-- decouples notification delivery from person.email
-- lets you disable or verify communication-specific contact points
-- ================================================================

CREATE TABLE person_contact_method (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,

    channel TEXT NOT NULL,
    CONSTRAINT chk_person_contact_method_channel
      CHECK (channel IN ('Email', 'SMS')),

    contact_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMPTZ,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),

    CONSTRAINT uq_person_contact_method UNIQUE (person_id, channel, contact_value)
);

-- ================================================================
-- NOTIFICATION TOPIC
-- gives you a maintainable set of communication purposes.
-- ================================================================

CREATE TABLE notification_topic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    category TEXT NOT NULL,
    CONSTRAINT chk_notification_topic_category
      CHECK (category IN ('Transactional', 'Marketing', 'Operational', 'Greeting')),

    audience_scope TEXT NOT NULL DEFAULT 'Any',
    CONSTRAINT chk_notification_topic_audience_scope
      CHECK (audience_scope IN ('Patient', 'Staff', 'Any')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- ================================================================
-- PERSON NOTIFICATION PREFERENCE
-- decoupled preferences
-- ================================================================

CREATE TABLE person_notification_preference (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES notification_topic(id) ON DELETE CASCADE,

    channel TEXT NOT NULL,
    CONSTRAINT chk_person_notification_preference_channel
      CHECK (channel IN ('Email', 'SMS')),

    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    -- For marketing/consent-sensitive cases
    opt_in_status TEXT NOT NULL DEFAULT 'Implicit',
    CONSTRAINT chk_person_notification_preference_opt_in_status
      CHECK (opt_in_status IN ('Implicit', 'Explicit', 'OptedOut')),

    opted_in_at TIMESTAMPTZ,
    opted_out_at TIMESTAMPTZ,
    source VARCHAR(100), -- e.g. FrontDesk, WebForm, Imported, AdminPanel

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),

    CONSTRAINT uq_person_notification_preference UNIQUE (person_id, topic_id, channel)
);

-- ================================================================
-- NOTIFICATION TEMPLATE
-- reusable templates
-- ================================================================


CREATE TABLE notification_template (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    topic_id UUID NOT NULL REFERENCES notification_topic(id),

    channel TEXT NOT NULL,
    CONSTRAINT chk_notification_template_channel
      CHECK (channel IN ('Email', 'SMS')),

    audience_scope TEXT NOT NULL DEFAULT 'Any',
    CONSTRAINT chk_notification_template_audience_scope
      CHECK (audience_scope IN ('Patient', 'Staff', 'Any')),

    provider TEXT NOT NULL DEFAULT 'AmazonSES',
    CONSTRAINT chk_notification_template_provider
      CHECK (provider IN ('AmazonSES', 'GenericSMTP', 'SMS', 'Other')),

    subject_template VARCHAR(255),
    body_text TEXT,
    body_html TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- ================================================================
-- NOTIFICATION CAMPAIGN
-- ================================================================


CREATE TABLE notification_campaign (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    topic_id UUID NOT NULL REFERENCES notification_topic(id),
    template_id UUID REFERENCES notification_template(id),

    channel TEXT NOT NULL,
    CONSTRAINT chk_notification_campaign_channel
      CHECK (channel IN ('Email', 'SMS')),

    audience_scope TEXT NOT NULL DEFAULT 'Any',
    CONSTRAINT chk_notification_campaign_audience_scope
      CHECK (audience_scope IN ('Patient', 'Staff', 'Any')),

    status TEXT NOT NULL DEFAULT 'Draft',
    CONSTRAINT chk_notification_campaign_status
      CHECK (status IN ('Draft', 'Scheduled', 'Running', 'Completed', 'Cancelled')),

    scheduled_at TIMESTAMPTZ,
    launched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    description TEXT,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);


-- ================================================================
-- NOTIFICATION
-- outbound notification records
-- ================================================================

CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES notification_topic(id),
    template_id UUID REFERENCES notification_template(id),
    campaign_id UUID REFERENCES notification_campaign(id) ON DELETE SET NULL,

    appointment_id UUID REFERENCES appointment(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patient(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

    channel TEXT NOT NULL,
    CONSTRAINT chk_notification_channel
      CHECK (channel IN ('Email', 'SMS')),

    provider TEXT NOT NULL DEFAULT 'AmazonSES',
    CONSTRAINT chk_notification_provider
      CHECK (provider IN ('AmazonSES', 'GenericSMTP', 'SMS', 'Other')),

    status TEXT NOT NULL DEFAULT 'Queued',
    CONSTRAINT chk_notification_status
      CHECK (status IN ('Queued', 'Processing', 'Sent', 'Partial', 'Failed', 'Cancelled')),

    subject_rendered VARCHAR(255),
    body_rendered_text TEXT,
    body_rendered_html TEXT,

    scheduled_for TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,

    error_message TEXT,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);


-- ================================================================
-- NOTIFICATION RECIPIENT
-- ================================================================

CREATE TABLE notification_recipient (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notification(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    contact_method_id UUID REFERENCES person_contact_method(id) ON DELETE SET NULL,

    recipient_address VARCHAR(255) NOT NULL,

    recipient_type TEXT NOT NULL DEFAULT 'Primary',
    CONSTRAINT chk_notification_recipient_type
      CHECK (recipient_type IN ('Primary', 'CC', 'BCC')),

    delivery_status TEXT NOT NULL DEFAULT 'Queued',
    CONSTRAINT chk_notification_recipient_delivery_status
      CHECK (delivery_status IN (
        'Queued',
        'Sent',
        'Delivered',
        'Failed',
        'Bounced',
        'Complained',
        'Rejected',
        'Suppressed',
        'Opened',
        'Clicked'
      )),

    provider_message_id VARCHAR(255),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),

    CONSTRAINT uq_notification_recipient UNIQUE (notification_id, person_id, recipient_address)
);

-- ================================================================
-- NOTIFICATION PROVIDER EVENT
-- ================================================================


CREATE TABLE notification_provider_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_recipient_id UUID NOT NULL REFERENCES notification_recipient(id) ON DELETE CASCADE,

    provider TEXT NOT NULL DEFAULT 'AmazonSES',
    CONSTRAINT chk_notification_provider_event_provider
      CHECK (provider IN ('AmazonSES', 'GenericSMTP', 'SMS', 'Other')),

    event_type TEXT NOT NULL,
    CONSTRAINT chk_notification_provider_event_type
      CHECK (event_type IN (
        'Send',
        'Delivery',
        'Bounce',
        'Complaint',
        'Reject',
        'Open',
        'Click',
        'RenderingFailure',
        'DeliveryDelay',
        'SubscriptionChange'
      )),

    event_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payload JSONB,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ================================================================
-- PERSONAL CHANNEL SUPRESSION
-- ================================================================


CREATE TABLE person_channel_suppression (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,

    channel TEXT NOT NULL,
    CONSTRAINT chk_person_channel_suppression_channel
      CHECK (channel IN ('Email', 'SMS')),

    contact_value VARCHAR(255),
    reason TEXT NOT NULL,
    suppressed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),

    CONSTRAINT uq_person_channel_suppression UNIQUE (person_id, channel, contact_value)
);

-- ================================================================
-- INDEXES
-- ================================================================


CREATE INDEX idx_person_contact_method_person_id
    ON person_contact_method (person_id);

CREATE INDEX idx_person_contact_method_channel
    ON person_contact_method (channel);

CREATE INDEX idx_person_contact_method_contact_value
    ON person_contact_method (contact_value);

CREATE INDEX idx_notification_topic_category
    ON notification_topic (category);

CREATE INDEX idx_person_notification_preference_person_id
    ON person_notification_preference (person_id);

CREATE INDEX idx_person_notification_preference_topic_id
    ON person_notification_preference (topic_id);

CREATE INDEX idx_notification_template_topic_id
    ON notification_template (topic_id);

CREATE INDEX idx_notification_template_channel
    ON notification_template (channel);

CREATE INDEX idx_notification_campaign_topic_id
    ON notification_campaign (topic_id);

CREATE INDEX idx_notification_campaign_status
    ON notification_campaign (status);

CREATE INDEX idx_notification_campaign_scheduled_at
    ON notification_campaign (scheduled_at);

CREATE INDEX idx_notification_topic_id
    ON notification (topic_id);

CREATE INDEX idx_notification_template_id
    ON notification (template_id);

CREATE INDEX idx_notification_campaign_id
    ON notification (campaign_id);

CREATE INDEX idx_notification_appointment_id
    ON notification (appointment_id);

CREATE INDEX idx_notification_patient_id
    ON notification (patient_id);

CREATE INDEX idx_notification_staff_id
    ON notification (staff_id);

CREATE INDEX idx_notification_status
    ON notification (status);

CREATE INDEX idx_notification_scheduled_for
    ON notification (scheduled_for);

CREATE INDEX idx_notification_recipient_notification_id
    ON notification_recipient (notification_id);

CREATE INDEX idx_notification_recipient_person_id
    ON notification_recipient (person_id);

CREATE INDEX idx_notification_recipient_delivery_status
    ON notification_recipient (delivery_status);

CREATE INDEX idx_notification_recipient_provider_message_id
    ON notification_recipient (provider_message_id);

CREATE INDEX idx_notification_provider_event_recipient_id
    ON notification_provider_event (notification_recipient_id);

CREATE INDEX idx_notification_provider_event_type
    ON notification_provider_event (event_type);

CREATE INDEX idx_person_channel_suppression_person_id
    ON person_channel_suppression (person_id);

CREATE INDEX idx_person_channel_suppression_channel
    ON person_channel_suppression (channel);


-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER set_timestamp_person_contact_method
BEFORE UPDATE ON person_contact_method
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_notification_topic
BEFORE UPDATE ON notification_topic
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_person_notification_preference
BEFORE UPDATE ON person_notification_preference
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_notification_template
BEFORE UPDATE ON notification_template
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_notification_campaign
BEFORE UPDATE ON notification_campaign
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_notification
BEFORE UPDATE ON notification
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_notification_recipient
BEFORE UPDATE ON notification_recipient
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
