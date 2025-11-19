BEGIN;

-- 1. Delete from tables with no or least dependencies (or deepest in the dependency chain)
DELETE FROM sale_item;
DELETE FROM payment;
DELETE FROM billing_line_item;
DELETE FROM prescription;
DELETE FROM treatment;
DELETE FROM document;
DELETE FROM tooth;

-- 2. Delete from intermediate tables
DELETE FROM billing;
DELETE FROM appointment;
DELETE FROM patient;
DELETE FROM staff;

-- 3. Delete from lookup/core tables (least dependent)
DELETE FROM role;
DELETE FROM service;
DELETE FROM specialty;
DELETE FROM appointment_status;

DELETE FROM document_type;
DELETE FROM tooth_status;
DELETE FROM discount_type;
DELETE FROM person; -- Person is usually the root of many relationships

-- Commit the transaction if all deletions were successful
COMMIT;