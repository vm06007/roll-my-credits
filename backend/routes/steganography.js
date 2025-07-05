import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import steganographyService from '../services/steganography.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(dirname(__dirname), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/encode', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const inputPath = req.file.path;
    const outputFilename = `encoded-${path.parse(req.file.filename).name}.png`;
    const outputPath = join(dirname(__dirname), 'output', outputFilename);

    const encodedImage = await steganographyService.encodeMessage(inputPath, message);
    await encodedImage.writeAsync(outputPath);

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Could not clean up uploaded file:', cleanupError.message);
    }

    res.json({
      success: true,
      filename: outputFilename,
      url: `/output/${outputFilename}`
    });

  } catch (error) {
    console.error('Encoding error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not clean up uploaded file after error:', cleanupError.message);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
});

router.post('/decode', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Decoding file:', req.file.filename, 'at path:', req.file.path);
    
    const inputPath = req.file.path;
    const message = await steganographyService.decodeMessage(inputPath);

    console.log('Successfully decoded message:', message);

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Could not clean up uploaded file:', cleanupError.message);
    }

    res.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Decoding error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not clean up uploaded file after error:', cleanupError.message);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
});

export default router;
