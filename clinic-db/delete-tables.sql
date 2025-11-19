--SET FOREIGN_KEY_CHECKS = 0;
-- DROP TYPE IF EXISTS GENDER_ENUM CASCADE;
-- DROP TYPE IF EXISTS bill_status_enum CASCADE;
-- DROP TYPE IF EXISTS payment_method_enum CASCADE;
-- DROP TABLE IF EXISTS payment;
-- DROP TABLE IF EXISTS billing;
-- DROP TABLE IF EXISTS sale_item;
-- DROP TABLE IF EXISTS discount_type;
-- DROP TABLE IF EXISTS prescription;
-- DROP TABLE IF EXISTS treatment;
-- DROP TABLE IF EXISTS service;
-- DROP TABLE IF EXISTS appointment;
-- DROP TABLE IF EXISTS tooth;
-- DROP TABLE IF EXISTS document;
-- DROP TABLE IF EXISTS tooth_status;
-- DROP TABLE IF EXISTS appointment_status;
-- DROP TABLE IF EXISTS document_type;
-- DROP TABLE IF EXISTS speciality;
-- DROP TABLE IF EXISTS roles;
-- DROP TABLE IF EXISTS staff;
-- DROP TABLE IF EXISTS patient;
-- DROP TABLE IF EXISTS person;
-- DROP TABLE IF EXISTS billing_line_item;
--SET FOREIGN_KEY_CHECKS = 1;
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END;
$$;

