import multer from 'multer';
import { ensureBucket, minioBucket, minioClient } from '../config/storage.js';
import { buildObjectName } from '../utils/fileHelper.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024
  }
});

export const uploadMiddleware = upload.single('file');

export const uploadLog = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Expected form field: file' });
    }

    await ensureBucket();

    const objectName = buildObjectName(req.file.originalname);
    await minioClient.putObject(
      minioBucket,
      objectName,
      req.file.buffer,
      req.file.size,
      {
        'Content-Type': req.file.mimetype || 'application/octet-stream'
      }
    );

    return res.status(201).json({
      message: 'File uploaded successfully',
      bucket: minioBucket,
      objectName,
      size: req.file.size
    });
  } catch (error) {
    return next(error);
  }
};
