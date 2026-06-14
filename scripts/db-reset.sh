#!/usr/bin/env bash
set -euo pipefail

# Reset Postgres DB: drop all public tables, recreate schema, seed inserts.
# Usage examples:
#   PGHOST=localhost PGPORT=5432 PGUSER=clinic_backend_user PGPASSWORD=pD7pr PGDATABASE=clinic_db \
#     ./scripts/db-reset.sh
#
# Or with flags:
#   ./scripts/db-reset.sh --host localhost --port 5432 --user clinic_backend_user --db clinic_db --password pD7pr

HOST="${PGHOST:-localhost}"
PORT="${PGPORT:-5432}"
USER="${PGUSER:-clinic_backend_user}"
DB="${PGDATABASE:-clinic_db}"
PASS="${PGPASSWORD:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) HOST="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    --user) USER="$2"; shift 2;;
    --db) DB="$2"; shift 2;;
    --password) PASS="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql not found. Install PostgreSQL client or run via docker:"
  echo "  docker run --rm -it -v $(pwd):/w -w /w --network host -e PGPASSWORD=${PASS} postgres:16-alpine \\\n+         psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -f clinic-db/delete-tables.sql && \\\n+         psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -f clinic-db/database-schema.sql && \\\n+         psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -f clinic-db/insert-statement.sql"
  exit 1
fi

export PGPASSWORD="${PASS}"

echo "Dropping all public tables on ${HOST}:${PORT}/${DB} as ${USER}…"
psql -v ON_ERROR_STOP=1 -h "${HOST}" -p "${PORT}" -U "${USER}" -d "${DB}" -f clinic-db/delete-tables.sql

echo "Recreating schema…"
psql -v ON_ERROR_STOP=1 -h "${HOST}" -p "${PORT}" -U "${USER}" -d "${DB}" -f clinic-db/database-schema.sql

echo "Seeding data…"
psql -v ON_ERROR_STOP=1 -h "${HOST}" -p "${PORT}" -U "${USER}" -d "${DB}" -f clinic-db/insert-statement.sql

echo "Done."

