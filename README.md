# Distributed Log Analytics and Anomaly Detection Platform

An end-to-end distributed analytics system that ingests raw logs, processes them with Spark, flags anomalies, and serves live insights through a web dashboard.

This project demonstrates practical distributed system design: decoupled ingestion, scalable compute, persistent analytics storage, and a user-facing observability layer.

## Why this project matters

- Handles large log ingestion through object storage instead of API server memory.
- Processes data in a Spark cluster rather than single-node scripts.
- Separates responsibilities across frontend, API, compute, and storage layers.
- Provides operationally useful outputs: traffic trends, status code breakdown, and anomaly alerts.

## Demo

- Upload access logs from the frontend.
- Backend streams files to MinIO (S3-compatible object storage).
- Spark computes per-minute metrics and anomaly signals.
- Results are stored in MongoDB and visualized in dashboard charts and alert tables.

### Quick smoke run

1. Start services (sections below).
2. Upload `data/sample_nginx_logs.txt` or `data/sample_app_logs.json`.
3. Click **Upload and Analyze**.
4. View traffic trends, status distribution, and anomalies on the dashboard.

## Architecture

- **Frontend (`frontend/`)**: React dashboard for file upload, charts, and anomaly alerts.
- **Backend (`backend/`)**: Express API for upload ingestion, job triggering, and analytics queries.
- **Compute (`spark-jobs/`)**: PySpark pipeline for parsing, aggregation, and anomaly detection.
- **Storage (`MinIO + MongoDB`)**: Raw log storage in MinIO, processed analytics in MongoDB.
- **Infrastructure (`docker/`)**: Reproducible local distributed runtime using Docker Compose.

## System Flow

1. User uploads a log file in the frontend.
2. Backend stores the file in the MinIO `raw-logs` bucket.
3. Backend triggers Spark processing (`Livy` optional, `spark-submit` fallback included).
4. Spark parses logs, computes rolling metrics, and detects outliers.
5. Spark writes output collections (`log_stats`, `anomalies`) to MongoDB.
6. Frontend fetches analytics from API endpoints and renders visualizations.

## Folder Layout

- `docker/docker-compose.yml` – Local distributed infrastructure.
- `docker/spark-submit.sh` – Helper script to execute Spark jobs.
- `backend/` – Node.js API, controllers, models, routes.
- `frontend/` – React app (upload + dashboard UI).
- `spark-jobs/` – PySpark processing modules and entrypoint.
- `data/` – Sample log files for quick testing.

## Prerequisites

- Docker Desktop + Docker Compose
- Node.js 18+
- Python 3.10+ (only needed if running Spark jobs outside containers)

## 1) Start Infrastructure

From repository root:

```bash
docker compose -f docker/docker-compose.yml up -d
```

Optional: copy `docker/.env.example` values into a root-level `.env` file to override ports/images/credentials without editing compose YAML.

Verify:
- Containers are healthy via `docker compose -f docker/docker-compose.yml ps`
- MinIO bucket initialization is handled by the `minio-init` service
- Runtime ports and credentials are environment-driven

## 2) Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

`backend/.env` contains all Spark submit and Docker fallback settings (packages, service name, submit command, ivy path) so no code edits are needed per environment.

Optional: set `LIVY_URL` in `backend/.env` to trigger jobs through Livy.
If `LIVY_URL` is empty, backend falls back to `spark-submit`.

API endpoints:
- `POST /api/upload` (multipart form field: `file`)
- `POST /api/analyze` with `{ "objectName": "uploads/..." }`
- `GET /api/results`
- `GET /api/anomalies`
- `GET /api/status/:id` (Livy mode only)

## 3) Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL is defined by your Vite runtime configuration and environment settings.

## 4) Run Spark Pipeline

### Option A: Trigger from backend
1. Upload from UI.
2. Backend triggers Livy or `spark-submit`.
3. Spark writes to MongoDB collections: `log_stats`, `anomalies`.

### Option B: Manual helper

```bash
bash docker/spark-submit.sh uploads/sample_nginx_logs.txt
```

> On Windows PowerShell without bash, run the equivalent `docker compose ... spark-submit` command manually.

## Data Processing Details

- `jobs/log_parser.py`: Regex parsing for Nginx/Apache logs + JSON log parser path
- `jobs/stats_aggregator.py`: Per-minute traffic + status distribution
- `jobs/anomaly_detector.py`: Statistical outlier detection (95th percentile thresholds)
- `main.py`: Orchestrates read (`s3a://raw-logs/...`) -> transform -> write

## Tech Stack

- Frontend: React, Vite, Axios, Recharts, React Dropzone
- Backend: Node.js, Express, Multer, Mongoose, MinIO SDK
- Data Processing: PySpark (Spark SQL/DataFrame APIs)
- Storage: MinIO (S3-compatible), MongoDB
- Infrastructure: Docker Compose, Spark master + workers

## Portfolio Highlights

- Distributed data pipeline with Spark cluster + object storage + NoSQL sink.
- Production-style decoupling: upload service, compute service, and dashboard service.
- Configurable runtime via environment variables (Docker + backend + frontend).
- Supports both text access logs and JSON app logs.

## Notes

- For very large logs, upload to MinIO first (already implemented) so Spark reads data in parallel.
- Livy is optional in this starter and can be added as needed per deployment.
- Keep `data/` local and out of git except examples.
