import 'dotenv/config';
import * as Minio from 'minio';

const getRequiredEnv = (name, fallback) => {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

const minioPort = Number(getRequiredEnv('MINIO_PORT', '9000'));

export const minioClient = new Minio.Client({
  endPoint: getRequiredEnv('MINIO_ENDPOINT', 'localhost'),
  port: minioPort,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: getRequiredEnv('MINIO_ACCESS_KEY'),
  secretKey: getRequiredEnv('MINIO_SECRET_KEY')
});

export const minioBucket = getRequiredEnv('MINIO_BUCKET', 'raw-logs');

export const ensureBucket = async () => {
  const exists = await minioClient.bucketExists(minioBucket);
  if (!exists) {
    await minioClient.makeBucket(minioBucket, 'us-east-1');
  }
};
