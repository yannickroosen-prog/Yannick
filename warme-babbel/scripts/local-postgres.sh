#!/usr/bin/env bash
# Start/stop een lokale PostgreSQL 16 (zonder Docker) voor RLS-tests.
# Gebruik: bash scripts/local-postgres.sh start|stop|reset|status
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${LOCAL_PG_DIR:-$ROOT/.localdb}"
PORT="${LOCAL_PG_PORT:-54329}"
DB_NAME="${LOCAL_PG_DB:-warme_babbel_test}"
PG_BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
[ -n "$PG_BIN" ] || PG_BIN="$(dirname "$(command -v pg_ctl)")"

# initdb weigert als root; gebruik dan de gebruiker "nobody".
RUN_AS=""
if [ "$(id -u)" = "0" ]; then RUN_AS="nobody"; fi
run_pg() {
  if [ -n "$RUN_AS" ]; then
    su "$RUN_AS" -s /bin/bash -c "$*"
  else
    bash -c "$*"
  fi
}

start() {
  mkdir -p "$DATA_DIR"
  [ -n "$RUN_AS" ] && chown -R "$RUN_AS" "$DATA_DIR"
  if [ ! -f "$DATA_DIR/data/PG_VERSION" ]; then
    echo "initdb → $DATA_DIR/data"
    run_pg "'$PG_BIN/initdb' -D '$DATA_DIR/data' -A trust -U postgres --locale=C.UTF-8 -E UTF8 >/dev/null"
  fi
  if run_pg "'$PG_BIN/pg_ctl' -D '$DATA_DIR/data' status >/dev/null 2>&1"; then
    echo "Postgres draait al op poort $PORT"
  else
    run_pg "'$PG_BIN/pg_ctl' -D '$DATA_DIR/data' -o '-p $PORT -k /tmp -c listen_addresses=127.0.0.1' -l '$DATA_DIR/postgres.log' -w start >/dev/null"
    echo "Postgres gestart op poort $PORT"
  fi
  "$PG_BIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -tc "select 1 from pg_database where datname='$DB_NAME'" | grep -q 1 \
    || "$PG_BIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -c "create database $DB_NAME" >/dev/null
  echo "TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:$PORT/$DB_NAME"
}

stop() {
  run_pg "'$PG_BIN/pg_ctl' -D '$DATA_DIR/data' -m fast stop" || true
}

reset() {
  "$PG_BIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -c "drop database if exists $DB_NAME" >/dev/null
  "$PG_BIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -c "create database $DB_NAME" >/dev/null
  echo "Database $DB_NAME leeggemaakt"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  reset) reset ;;
  status) run_pg "'$PG_BIN/pg_ctl' -D '$DATA_DIR/data' status" ;;
  *) echo "gebruik: $0 start|stop|reset|status"; exit 1 ;;
esac
