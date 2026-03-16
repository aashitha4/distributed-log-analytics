#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./spark-submit.sh <s3_key>"
  echo "Example: ./spark-submit.sh uploads/sample_nginx_logs.txt"
  exit 1
fi

S3_KEY="$1"
SPARK_MASTER_URL="${SPARK_MASTER_URL:-spark://spark-master:7077}"
SPARK_PACKAGES="${SPARK_PACKAGES:-org.apache.hadoop:hadoop-aws:3.3.4,org.mongodb.spark:mongo-spark-connector_2.12:10.3.0}"
SPARK_JOB_MAIN="${DOCKER_SPARK_JOB_MAIN:-/opt/spark/jobs/main.py}"

docker compose -f docker/docker-compose.yml exec spark-master /opt/spark/bin/spark-submit \
  --master "$SPARK_MASTER_URL" \
  --packages "$SPARK_PACKAGES" \
  "$SPARK_JOB_MAIN" \
  --s3-key "$S3_KEY"
