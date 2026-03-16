# Distributed Log Analytics and Anomaly Detection Platform

Monorepo implementation of a distributed log analytics platform using React, Node.js, Spark, MinIO, and MongoDB.

## Demo

- Upload access logs from the frontend dashboard.
- Backend streams file directly to MinIO (no local disk staging).
- Spark job computes per-minute traffic and anomaly signals.
- Processed results are written to MongoDB and visualized on charts + alerts table.

### Quick smoke run

1. Start services (sections below).
2. Upload `data/sample_nginx_logs.txt` or `data/sample_app_logs.json`.
3. Click **Upload and Analyze**.
4. Refresh dashboard to view `Traffic over Time`, status distribution, and anomalies.

## Architecture

- **Frontend (`frontend/`)**: Upload logs and visualize analytics/anomalies.
- **Backend (`backend/`)**: Streams uploads to MinIO, triggers Spark, serves results from MongoDB.
- **Spark Jobs (`spark-jobs/`)**: Parses logs, aggregates metrics, detects anomalies via percentile-based outlier logic, writes to MongoDB.
- **Docker Infra (`docker/`)**: MongoDB + MinIO + Spark Master/Workers for local distributed execution.

## System Flow

1. User uploads a log file from React frontend.
2. Node.js API stores raw file in MinIO bucket `raw-logs`.
3. API triggers Spark pipeline (`Livy` or `spark-submit` fallback).
4. Spark parses + aggregates logs and flags anomalies.
5. Spark writes `log_stats` and `anomalies` into MongoDB.
6. Dashboard fetches results using `/api/results` and `/api/anomalies`.

## Folder Layout

- `docker/docker-compose.yml` – MongoDB, MinIO, Spark cluster
- `docker/spark-submit.sh` – helper for local Spark submission
- `backend/` – Express API + Mongoose models
- `frontend/` – Vite React dashboard
- `spark-jobs/` – PySpark ETL + ML pipeline
- `data/` – sample logs

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
- Spark UI: http://localhost:8080
- MinIO Console: http://localhost:9001 (`minioadmin` / `minioadmin`)
- MongoDB: `mongodb://localhost:27017`

The `raw-logs` bucket is auto-created by `minio-init`.

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

Frontend runs at http://localhost:5173.

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

## Spark Pipeline Details

- `jobs/log_parser.py`: Regex parsing for Nginx/Apache logs + JSON log parser path
- `jobs/stats_aggregator.py`: Per-minute traffic + status distribution
- `jobs/anomaly_detector.py`: Statistical outlier detection (95th percentile thresholds)
- `main.py`: Orchestrates read (`s3a://raw-logs/...`) -> transform -> write

## Resume Highlights

- Distributed data pipeline with Spark cluster + object storage + NoSQL sink.
- Production-style decoupling: upload service, compute service, and dashboard service.
- Configurable runtime via environment variables (Docker + backend + frontend).
- Supports both text access logs and JSON app logs.

## Notes

- For very large logs, upload to MinIO first (already implemented) so Spark reads data in parallel.
- Livy is optional in this starter and can be added as needed per deployment.
- Keep `data/` local and out of git except examples.
