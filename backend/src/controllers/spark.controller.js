import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';

const livyUrl = process.env.LIVY_URL;
const sparkPackages = process.env.SPARK_PACKAGES || 'org.apache.hadoop:hadoop-aws:3.3.4,org.mongodb.spark:mongo-spark-connector_2.12:10.3.0';

const runSpawn = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      env: process.env,
      ...options
    });

    let stderr = '';
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`${command} failed with code ${code}: ${stderr}`));
      }
      return resolve({ exitCode: code });
    });
  });

const submitViaLivy = async (s3Key) => {
  const response = await axios.post(
    `${livyUrl.replace(/\/$/, '')}/batches`,
    {
      file: process.env.SPARK_JOB_MAIN || 'local:///opt/bitnami/spark/jobs/main.py',
      args: ['--s3-key', s3Key],
      conf: {
        'spark.hadoop.fs.s3a.endpoint': process.env.SPARK_S3A_ENDPOINT || `http://${process.env.MINIO_ENDPOINT || 'minio'}:${process.env.MINIO_PORT || 9000}`,
        'spark.hadoop.fs.s3a.access.key': process.env.MINIO_ACCESS_KEY,
        'spark.hadoop.fs.s3a.secret.key': process.env.MINIO_SECRET_KEY,
        'spark.hadoop.fs.s3a.path.style.access': process.env.SPARK_S3A_PATH_STYLE_ACCESS || 'true'
      }
    },
    { timeout: 30000 }
  );

  return {
    mode: 'livy',
    batchId: response.data.id,
    state: response.data.state
  };
};

const submitViaSparkSubmit = async (s3Key) => {
  const sparkHome = process.env.SPARK_HOME || '';
  const sparkSubmitCmd = sparkHome ? path.join(sparkHome, 'bin', 'spark-submit') : 'spark-submit';

  const args = [
    '--master',
    process.env.SPARK_MASTER_URL || 'spark://localhost:7077',
    '--deploy-mode',
    process.env.SPARK_DEPLOY_MODE || 'client',
    '--packages',
    sparkPackages,
    process.env.SPARK_JOB_MAIN || '../spark-jobs/main.py',
    '--s3-key',
    s3Key
  ];

  try {
    const result = await runSpawn(sparkSubmitCmd, args, { cwd: process.cwd() });
    return { mode: 'spark-submit', ...result };
  } catch (error) {
    const shouldFallbackToDocker =
      error.message.includes('ENOENT') ||
      process.env.SPARK_SUBMIT_IN_DOCKER === 'true';

    if (!shouldFallbackToDocker) {
      throw error;
    }

    const projectRoot = path.resolve(process.cwd(), '..');
    const composeFile = process.env.DOCKER_COMPOSE_FILE || 'docker/docker-compose.yml';
    const dockerCli = process.env.DOCKER_CLI || 'docker';
    const dockerSparkService = process.env.DOCKER_SPARK_SERVICE || 'spark-master';
    const dockerSparkSubmitCommand = process.env.DOCKER_SPARK_SUBMIT_COMMAND || '/opt/spark/bin/spark-submit';
    const dockerSparkMain = process.env.DOCKER_SPARK_JOB_MAIN || '/opt/spark/jobs/main.py';
    const dockerSparkMasterUrl = process.env.DOCKER_SPARK_MASTER_URL || 'spark://spark-master:7077';
    const sparkJarsIvy = process.env.SPARK_JARS_IVY || '/tmp/.ivy2';
    const dockerArgs = [
      'compose',
      '-f',
      composeFile,
      'exec',
      '-T',
      dockerSparkService,
      dockerSparkSubmitCommand,
      '--master',
      dockerSparkMasterUrl,
      '--conf',
      `spark.jars.ivy=${sparkJarsIvy}`,
      '--packages',
      sparkPackages,
      dockerSparkMain,
      '--s3-key',
      s3Key
    ];

    const result = await runSpawn(dockerCli, dockerArgs, { cwd: projectRoot });
    return { mode: 'docker-spark-submit', ...result };
  }
};

export const triggerAnalysis = async (req, res, next) => {
  try {
    const { objectName } = req.body;
    if (!objectName) {
      return res.status(400).json({ error: 'objectName is required' });
    }

    const result = livyUrl ? await submitViaLivy(objectName) : await submitViaSparkSubmit(objectName);

    return res.status(202).json({
      message: 'Analysis triggered',
      objectName,
      ...result
    });
  } catch (error) {
    return next(error);
  }
};

export const getJobStatus = async (req, res, next) => {
  try {
    if (!livyUrl) {
      return res.status(400).json({ error: 'LIVY_URL is not configured; job status endpoint unavailable.' });
    }

    const { id } = req.params;
    const response = await axios.get(`${livyUrl.replace(/\/$/, '')}/batches/${id}`, { timeout: 30000 });
    return res.json(response.data);
  } catch (error) {
    return next(error);
  }
};
