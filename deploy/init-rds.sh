#!/usr/bin/env bash
# =====================================================================
# CloudRestaurant - initialize the Amazon RDS SQL Server database
# Run this ONCE from the EC2 instance (or any machine that can reach RDS)
# after the RDS instance is "Available".
#
#   RDS_ENDPOINT=cr-db.xxxx.rds.amazonaws.com \
#   RDS_USER=admin RDS_PASSWORD='YourStrongRdsPassw0rd!' \
#   bash deploy/init-rds.sh
#
# It uses a throwaway mssql-tools container so you don't need sqlcmd installed.
# =====================================================================
set -e

: "${RDS_ENDPOINT:?Set RDS_ENDPOINT}"
: "${RDS_USER:?Set RDS_USER}"
: "${RDS_PASSWORD:?Set RDS_PASSWORD}"

DBDIR="$(cd "$(dirname "$0")/../database" && pwd)"

echo ">>> Applying schema.sql to RDS ($RDS_ENDPOINT)..."
docker run --rm -v "$DBDIR":/scripts mcr.microsoft.com/mssql-tools \
  /opt/mssql-tools/bin/sqlcmd -S "$RDS_ENDPOINT" -U "$RDS_USER" -P "$RDS_PASSWORD" -i /scripts/schema.sql

echo ">>> Applying seed.sql to RDS..."
docker run --rm -v "$DBDIR":/scripts mcr.microsoft.com/mssql-tools \
  /opt/mssql-tools/bin/sqlcmd -S "$RDS_ENDPOINT" -U "$RDS_USER" -P "$RDS_PASSWORD" -d CloudRestaurant -i /scripts/seed.sql

echo ">>> RDS database initialized."
