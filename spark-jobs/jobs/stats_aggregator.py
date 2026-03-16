from pyspark.sql import DataFrame
from pyspark.sql import functions as F


def build_minute_stats(parsed_df: DataFrame) -> DataFrame:
    aggregated = (
        parsed_df
        .groupBy(F.window(F.col('timestamp'), '1 minute').alias('minute_window'), 'source_file')
        .agg(
            F.count('*').alias('request_count'),
            F.sum(F.when(F.col('status_code') >= 400, 1).otherwise(0)).alias('error_count'),
            F.sum(F.when((F.col('status_code') >= 200) & (F.col('status_code') < 300), 1).otherwise(0)).alias('status2xx'),
            F.sum(F.when((F.col('status_code') >= 400) & (F.col('status_code') < 500), 1).otherwise(0)).alias('status4xx'),
            F.sum(F.when(F.col('status_code') >= 500, 1).otherwise(0)).alias('status5xx')
        )
        .withColumn('minuteWindow', F.col('minute_window.start'))
        .withColumn('errorRate', F.when(F.col('request_count') > 0, F.col('error_count') / F.col('request_count')).otherwise(F.lit(0.0)))
        .select(
            'source_file',
            'minuteWindow',
            'request_count',
            'error_count',
            'errorRate',
            'status2xx',
            'status4xx',
            'status5xx'
        )
        .withColumnRenamed('source_file', 'sourceFile')
        .withColumnRenamed('request_count', 'requestCount')
        .withColumnRenamed('error_count', 'errorCount')
    )

    return aggregated


def build_ip_minute_features(parsed_df: DataFrame) -> DataFrame:
    return (
        parsed_df
        .groupBy(F.window(F.col('timestamp'), '1 minute').alias('minute_window'), 'ip_address', 'source_file')
        .agg(
            F.count('*').alias('request_count'),
            F.sum(F.when(F.col('status_code') >= 400, 1).otherwise(0)).alias('error_count')
        )
        .withColumn('minuteWindow', F.col('minute_window.start'))
        .withColumn('error_rate', F.when(F.col('request_count') > 0, F.col('error_count') / F.col('request_count')).otherwise(F.lit(0.0)))
        .drop('minute_window')
    )
