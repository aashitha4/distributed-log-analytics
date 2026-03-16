import { Router } from 'express';
import { getAnomalies, getResults } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/results', getResults);
router.get('/anomalies', getAnomalies);

export default router;
