import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import steganographyRoutes from './routes/steganography.js';
import videoSteganographyRoutes from './routes/videoSteganography.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const uploadsDir = join(__dirname, 'uploads');
const outputDir = join(__dirname, 'output');

async function ensureDirectories() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

ensureDirectories();

app.use('/uploads', express.static(uploadsDir));
app.use('/output', express.static(outputDir));

app.use('/api/steganography', steganographyRoutes);
app.use('/api/video-steganography', videoSteganographyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
