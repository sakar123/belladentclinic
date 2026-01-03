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

-- Create DB if missing (psql conditional, not inside DO)
SELECT 1 FROM pg_database WHERE datname = :'db_name' \gset
\if :?column? = 1
  \echo 'Database :'db_name' already exists. Skipping CREATE DATABASE.'
\else
  \echo 'Creating database :'db_name' owned by :'app_user' ...
  CREATE DATABASE :"db_name" OWNER :"app_user";
\endif

-- Grants
GRANT ALL PRIVILEGES ON DATABASE :"db_name" TO :"app_user";

-- Optional: allow creating objects in public schema (handy for early dev)
\connect :"db_name"
GRANT USAGE, CREATE ON SCHEMA public TO :"app_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO :"app_user";

-- Optional extensions you may want (comment/uncomment)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

