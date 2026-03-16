import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDb } from './config/db.js';
import analyticsRoutes from './routes/analytics.routes.js';
import jobRoutes from './routes/job.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/upload', uploadRoutes);
app.use('/api', jobRoutes);
app.use('/api', analyticsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const start = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
