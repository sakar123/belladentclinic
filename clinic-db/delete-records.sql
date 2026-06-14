-- Truncate all tables in the current database (public schema), restarting identities and cascading to dependent tables.
-- This preserves the schema and only deletes data.

DO $$
DECLARE
    stmt text;
BEGIN
    SELECT 'TRUNCATE TABLE '
           || string_agg(format('%I.%I', schemaname, tablename), ', ')
           || ' RESTART IDENTITY CASCADE'
    INTO stmt
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
      AND tablename <> '__efmigrationshistory';

    IF stmt IS NOT NULL THEN
        RAISE NOTICE 'Executing: %', stmt;
        EXECUTE stmt;
    ELSE
        RAISE NOTICE 'No user tables found to truncate.';
    END IF;
END;
$$;


