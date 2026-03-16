from pyspark.sql import DataFrame
from pyspark.sql import functions as F


LOG_PATTERN = r'^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+([^\s"]+)\s*(\S*)"\s+(\d{3})\s+(\S+)'


def parse_logs(raw_df: DataFrame, source_file: str) -> DataFrame:
    extracted = raw_df.select(
        F.regexp_extract('value', LOG_PATTERN, 1).alias('ip_address'),
        F.regexp_extract('value', LOG_PATTERN, 2).alias('raw_timestamp'),
        F.regexp_extract('value', LOG_PATTERN, 3).alias('http_method'),
        F.regexp_extract('value', LOG_PATTERN, 4).alias('endpoint'),
        F.regexp_extract('value', LOG_PATTERN, 5).alias('protocol'),
        F.regexp_extract('value', LOG_PATTERN, 6).alias('status_code_str'),
        F.regexp_extract('value', LOG_PATTERN, 7).alias('bytes_sent_str')
    )

    parsed = (
        extracted
        .withColumn('timestamp', F.to_timestamp('raw_timestamp', 'dd/MMM/yyyy:HH:mm:ss Z'))
        .withColumn('status_code', F.col('status_code_str').cast('int'))
        .withColumn(
            'bytes_sent',
            F.when(F.col('bytes_sent_str') == '-', F.lit(0)).otherwise(F.col('bytes_sent_str').cast('int'))
        )
        .withColumn('source_file', F.lit(source_file))
        .drop('raw_timestamp', 'status_code_str', 'bytes_sent_str')
    )

    return parsed.filter(
        F.col('ip_address').isNotNull() &
        (F.col('ip_address') != '') &
        F.col('timestamp').isNotNull() &
        F.col('status_code').isNotNull()
    )


def parse_json_logs(json_df: DataFrame, source_file: str) -> DataFrame:
    parsed = (
        json_df
        .withColumn('timestamp', F.to_timestamp('timestamp'))
        .withColumn('ip_address', F.col('ip'))
        .withColumn('http_method', F.lit('UNKNOWN'))
        .withColumn('endpoint', F.coalesce(F.col('route'), F.lit('/')))
        .withColumn('protocol', F.lit('HTTP/1.1'))
        .withColumn('status_code', F.col('status').cast('int'))
        .withColumn('bytes_sent', F.lit(0).cast('int'))
        .withColumn('source_file', F.lit(source_file))
        .select(
            'ip_address',
            'timestamp',
            'http_method',
            'endpoint',
            'protocol',
            'status_code',
            'bytes_sent',
            'source_file'
        )
    )

    return parsed.filter(
        F.col('ip_address').isNotNull() &
        (F.col('ip_address') != '') &
        F.col('timestamp').isNotNull() &
        F.col('status_code').isNotNull()
    )
