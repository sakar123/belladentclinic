#!/usr/bin/env bash
set -euo pipefail

# Convenience wrapper for docker compose profiles

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ $# -eq 0 ]; then
  cat <<'USAGE'
Usage:
  scripts/run.sh [profiles...] [-- args...]

Profiles:
  db        Start Postgres
  api       Start .NET API
  tests     Run API tests (one-shot)
  portal    Start Next.js portal (http://localhost:3000)
  landing   Start landing page (http://localhost:3001)

Examples:
  # DB + API only
  scripts/run.sh db api

  # Portal + API (frontend points to API via service name)
  scripts/run.sh api portal

  # API + tests (runs tests once and exits)
  scripts/run.sh db tests

  # Landing only
  scripts/run.sh landing

Pass-through:
  Add -- to pass flags to docker compose, e.g. up -d or down
  scripts/run.sh db api -- up -d
USAGE
  exit 0
fi

profiles=()
args=()
pass=false
for a in "$@"; do
  if [ "$a" = "--" ]; then
    pass=true
    continue
  fi
  if ! $pass; then
    profiles+=("--profile" "$a")
  else
    args+=("$a")
  fi
done

if [ ${#args[@]} -eq 0 ]; then
  # default action
  args=(up)
fi

docker compose "${profiles[@]}" "${args[@]}"

