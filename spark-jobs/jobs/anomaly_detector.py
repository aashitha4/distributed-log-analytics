from pyspark.sql import DataFrame
from pyspark.sql import functions as F


def detect_anomalies(ip_features_df: DataFrame) -> DataFrame:
    if ip_features_df.rdd.isEmpty():
        return ip_features_df.sparkSession.createDataFrame([], schema='sourceFile string, ipAddress string, minuteWindow timestamp, requestCount long, errorRate double, cluster int, distanceFromCentroid double, reason string')

    req_threshold = ip_features_df.approxQuantile('request_count', [0.95], 0.05)[0]
    err_threshold = ip_features_df.approxQuantile('error_rate', [0.95], 0.05)[0]

    anomalies = (
        ip_features_df
        .filter(
            (F.col('request_count') >= F.lit(req_threshold)) |
            (F.col('error_rate') >= F.lit(err_threshold))
        )
        .withColumn(
            'reason',
            F.when(F.col('request_count') >= F.lit(req_threshold), F.lit('High request volume (95th percentile)'))
            .when(F.col('error_rate') >= F.lit(err_threshold), F.lit('High error rate (95th percentile)'))
            .otherwise(F.lit('Statistical outlier'))
        )
        .select(
            F.col('source_file').alias('sourceFile'),
            F.col('ip_address').alias('ipAddress'),
            F.col('minuteWindow'),
            F.col('request_count').alias('requestCount'),
            F.col('error_rate').alias('errorRate'),
            F.lit(-1).cast('int').alias('cluster'),
            F.lit(0.0).alias('distanceFromCentroid'),
            F.col('reason')
        )
    )

    return anomalies
