import argparse
from pyspark.sql import SparkSession

from jobs.anomaly_detector import detect_anomalies
from jobs.log_parser import parse_json_logs, parse_logs
from jobs.stats_aggregator import build_ip_minute_features, build_minute_stats
from shared.config import (
    MINIO_ACCESS_KEY,
    MINIO_BUCKET,
    MINIO_ENDPOINT,
    MINIO_SECRET_KEY,
    MONGO_DATABASE,
    MONGO_URI,
    SPARK_APP_NAME,
)


def build_spark_session() -> SparkSession:
    spark = (
        SparkSession.builder
        .appName(SPARK_APP_NAME)
        .config('spark.hadoop.fs.s3a.impl', 'org.apache.hadoop.fs.s3a.S3AFileSystem')
        .config('spark.hadoop.fs.s3a.endpoint', f'http://{MINIO_ENDPOINT}')
        .config('spark.hadoop.fs.s3a.access.key', MINIO_ACCESS_KEY)
        .config('spark.hadoop.fs.s3a.secret.key', MINIO_SECRET_KEY)
        .config('spark.hadoop.fs.s3a.path.style.access', 'true')
        .config('spark.hadoop.fs.s3a.connection.ssl.enabled', 'false')
        .config('spark.mongodb.write.connection.uri', MONGO_URI)
        .getOrCreate()
    )
    return spark


def write_to_mongo(df, collection: str):
    (
        df.write
        .format('mongodb')
        .mode('append')
        .option('database', MONGO_DATABASE)
        .option('collection', collection)
        .save()
    )


def run_pipeline(s3_key: str):
    spark = build_spark_session()

    input_path = f's3a://{MINIO_BUCKET}/{s3_key}'
    if s3_key.lower().endswith('.json'):
        json_df = spark.read.json(input_path)
        parsed_df = parse_json_logs(json_df, source_file=s3_key)
    else:
        raw_df = spark.read.text(input_path)
        parsed_df = parse_logs(raw_df, source_file=s3_key)

    stats_df = build_minute_stats(parsed_df)
    ip_features_df = build_ip_minute_features(parsed_df)
    anomalies_df = detect_anomalies(ip_features_df)

    write_to_mongo(stats_df, 'log_stats')
    if not anomalies_df.rdd.isEmpty():
        write_to_mongo(anomalies_df, 'anomalies')

    spark.stop()


def main():
    parser = argparse.ArgumentParser(description='Distributed log analytics pipeline')
    parser.add_argument('--s3-key', required=True, help='MinIO/S3 object key under raw-logs bucket')
    args = parser.parse_args()

    run_pipeline(args.s3_key)


if __name__ == '__main__':
    main()
