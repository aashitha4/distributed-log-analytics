from pyspark.sql.types import StructType, StructField, StringType, IntegerType, TimestampType

PARSED_LOG_SCHEMA = StructType(
    [
        StructField('ip_address', StringType(), True),
        StructField('timestamp', TimestampType(), True),
        StructField('http_method', StringType(), True),
        StructField('endpoint', StringType(), True),
        StructField('protocol', StringType(), True),
        StructField('status_code', IntegerType(), True),
        StructField('bytes_sent', IntegerType(), True),
        StructField('source_file', StringType(), True),
    ]
)
