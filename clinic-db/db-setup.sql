\set ON_ERROR_STOP on

-- ====== EDIT THESE 3 LINES PER ENV (prod/test) ======
\set db_name 'clinic_db'
\set app_user 'clinic_backend_user'
\set app_password 'pD7pr'
-- ====================================================

-- Create role/user if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password');
  END IF;
END $$;

-- Create DB if missing
SELECT count(*) AS db_exists FROM pg_database WHERE datname = :'db_name' \gset
\if :db_exists
  \echo 'Database already exists. Skipping CREATE DATABASE.'
\else
  \echo 'Creating database...'
  CREATE DATABASE :"db_name" OWNER :"app_user";
\endif

-- Grants
GRANT ALL PRIVILEGES ON DATABASE :"db_name" TO :"app_user";

-- Allow creating objects in public schema
\connect :"db_name"
GRANT USAGE, CREATE ON SCHEMA public TO :"app_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO :"app_user";
