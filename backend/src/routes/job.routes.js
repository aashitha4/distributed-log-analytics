import { Router } from 'express';
import { getJobStatus, triggerAnalysis } from '../controllers/spark.controller.js';

const router = Router();

router.post('/analyze', triggerAnalysis);
router.get('/status/:id', getJobStatus);

export default router;
