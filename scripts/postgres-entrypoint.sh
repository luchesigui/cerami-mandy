#!/bin/sh
set -eu

: "${POSTGRES_USER:?}"
: "${POSTGRES_PASSWORD:?}"
: "${POSTGRES_DB:?}"

export PGDATA=/var/lib/postgresql/data

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  initdb -D "$PGDATA" --auth-local=trust --auth-host=trust
  pg_ctl -D "$PGDATA" -o "-c listen_addresses='127.0.0.1'" -w start
  psql --username postgres --dbname postgres --set ON_ERROR_STOP=on \
    --set db_user="$POSTGRES_USER" --set db_password="$POSTGRES_PASSWORD" <<'SQL'
CREATE ROLE :"db_user" LOGIN SUPERUSER PASSWORD :'db_password';
SQL
  psql --username postgres --dbname postgres --set ON_ERROR_STOP=on \
    --set db_user="$POSTGRES_USER" --set db_name="$POSTGRES_DB" <<'SQL'
CREATE DATABASE :"db_name" OWNER :"db_user";
SQL
  pg_ctl -D "$PGDATA" -m fast -w stop
fi

exec postgres -D "$PGDATA" -c listen_addresses='*'
