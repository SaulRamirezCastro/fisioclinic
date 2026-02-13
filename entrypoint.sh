#!/bin/sh

echo "Waiting for PostgreSQL..."

while ! nc -z $DB_HOST 5432; do
  sleep 1
done

echo "Database ready"

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
