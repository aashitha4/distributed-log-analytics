import os

MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
MINIO_BUCKET = os.getenv('MINIO_BUCKET', 'raw-logs')

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/log_analytics')
MONGO_DATABASE = os.getenv('MONGO_DATABASE', 'log_analytics')

SPARK_APP_NAME = os.getenv('SPARK_APP_NAME', 'distributed-log-analytics')
