#!/bin/sh

# Wait until the backend directory is created
until cd /app
do
    echo "Waiting for server volume..."
done

# run a worker
# I like having only one task per worker but you can change it
# by increasing the concurrency
echo "Starting celery worker..."
celery -A b3_ver worker -B -l info


