#!/usr/bin/env bash
set -euo pipefail

# Clean the Postgres database inside a running container, then stop it.
# Requires psql inside the container (present in postgres image).

CONTAINER_NAME=${1:-clinic-db-local}
DB_NAME=${DB_NAME:-clinic_db}
DB_USER=${DB_USER:-clinic_backend_user}
SQL_FILE=${SQL_FILE:-/sql/delete-records.sql}

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container '${CONTAINER_NAME}' is not running. Start it first (docker start ${CONTAINER_NAME})." >&2
  exit 1
fi

echo "Running cleanup SQL (${SQL_FILE}) on ${CONTAINER_NAME}/${DB_NAME}..."
docker exec -e PGPASSWORD="${POSTGRES_PASSWORD:-}" "${CONTAINER_NAME}" \
  psql -U "${DB_USER}" -d "${DB_NAME}" -f "${SQL_FILE}"

echo "Stopping container ${CONTAINER_NAME}..."
docker stop "${CONTAINER_NAME}"
echo "Done."

