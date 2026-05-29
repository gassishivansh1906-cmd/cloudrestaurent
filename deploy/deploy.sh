#!/usr/bin/env bash
# =====================================================================
# CloudRestaurant - manual deploy / update on the EC2 host
# Run from inside the project directory on the server.
# =====================================================================
set -e

echo ">>> Pulling latest code..."
git fetch --all
git reset --hard origin/main

if [ ! -f .env ]; then
  echo "!! No .env found. Copy .env.example to .env and fill in secrets first."
  exit 1
fi

echo ">>> Rebuilding and starting containers..."
docker compose up -d --build

echo ">>> Cleaning up old images..."
docker image prune -f

echo ">>> Current status:"
docker compose ps
echo ">>> Done. Frontend on :80, API on :5000."
