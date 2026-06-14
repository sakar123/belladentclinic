START TRANSACTION;
CREATE TABLE periostatus (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    staff_id uuid NOT NULL,
    examination_date timestamp with time zone NOT NULL,
    smoker boolean NOT NULL,
    bone_loss integer NOT NULL,
    CONSTRAINT "PK_periostatus" PRIMARY KEY (id),
    CONSTRAINT "FK_periostatus_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
    CONSTRAINT "FK_periostatus_staff_staff_id" FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE CASCADE
);

CREATE TABLE treatmenttoothsurface (
    id uuid NOT NULL,
    treatment_id uuid NOT NULL,
    tooth_id uuid NOT NULL,
    surface character varying(10) NOT NULL,
    CONSTRAINT "PK_treatmenttoothsurface" PRIMARY KEY (id),
    CONSTRAINT "FK_treatmenttoothsurface_tooth_tooth_id" FOREIGN KEY (tooth_id) REFERENCES tooth (id) ON DELETE CASCADE,
    CONSTRAINT "FK_treatmenttoothsurface_treatment_treatment_id" FOREIGN KEY (treatment_id) REFERENCES treatment (id) ON DELETE CASCADE
);

CREATE TABLE periomeasurement (
    id uuid NOT NULL,
    perio_status_id uuid NOT NULL,
    tooth_number integer NOT NULL,
    site_index integer NOT NULL,
    pocket_depth integer NOT NULL,
    clinical_attachment_level integer NOT NULL,
    gingival_margin integer NOT NULL,
    bleeding_on_probing boolean NOT NULL,
    mobility integer NOT NULL,
    furcation integer NOT NULL,
    CONSTRAINT "PK_periomeasurement" PRIMARY KEY (id),
    CONSTRAINT "FK_periomeasurement_periostatus_perio_status_id" FOREIGN KEY (perio_status_id) REFERENCES periostatus (id) ON DELETE CASCADE
);

UPDATE discount_type SET created_at = TIMESTAMPTZ '2026-04-10T02:03:46.376349Z', updated_at = TIMESTAMPTZ '2026-04-10T02:03:46.376349Z'
WHERE id = '782b35f4-1252-4de6-a710-9b2681112f7f';

UPDATE discount_type SET created_at = TIMESTAMPTZ '2026-04-10T02:03:46.376309Z', updated_at = TIMESTAMPTZ '2026-04-10T02:03:46.376309Z'
WHERE id = 'd0115ad2-4098-42f9-b1c2-1faddf373ccb';

UPDATE tooth_status SET created_at = TIMESTAMPTZ '2026-04-10T02:03:46.37655Z', updated_at = TIMESTAMPTZ '2026-04-10T02:03:46.37655Z'
WHERE id = '23ab8f4c-1944-46df-80d9-dc137752f649';

UPDATE tooth_status SET created_at = TIMESTAMPTZ '2026-04-10T02:03:46.376594Z', updated_at = TIMESTAMPTZ '2026-04-10T02:03:46.376594Z'
WHERE id = '49bc7706-a3d4-4927-a4d8-9c505dbd426a';

UPDATE tooth_status SET created_at = TIMESTAMPTZ '2026-04-10T02:03:46.376594Z', updated_at = TIMESTAMPTZ '2026-04-10T02:03:46.376594Z'
WHERE id = '58921fa0-25c3-45f4-976c-ea17379a98ed';

UPDATE tooth_status SET created_at = TIMESTAMPTZ '2026-04-10T02:03:46.376594Z', updated_at = TIMESTAMPTZ '2026-04-10T02:03:46.376594Z'
WHERE id = '665eb447-6d2e-4889-97b0-ea80c931c7bd';

CREATE INDEX "IX_periomeasurement_perio_status_id" ON periomeasurement (perio_status_id);

CREATE INDEX "IX_periostatus_patient_id" ON periostatus (patient_id);

CREATE INDEX "IX_periostatus_staff_id" ON periostatus (staff_id);

CREATE INDEX "IX_treatmenttoothsurface_tooth_id" ON treatmenttoothsurface (tooth_id);

CREATE INDEX "IX_treatmenttoothsurface_treatment_id" ON treatmenttoothsurface (treatment_id);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260410020346_AddOdontogramAndPerioModels', '9.0.1');

COMMIT;

