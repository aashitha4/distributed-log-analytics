import { Router } from 'express';
import { uploadLog, uploadMiddleware } from '../controllers/upload.controller.js';

const router = Router();

router.post('/', uploadMiddleware, uploadLog);

export default router;
