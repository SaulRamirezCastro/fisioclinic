#!/bin/sh
set -e

echo "Checking Python dependencies..."
pip install --no-cache-dir -r requirements.txt

exec "$@"
