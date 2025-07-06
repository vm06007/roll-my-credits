const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const steganographyRoutes = require('../routes/steganography');
const videoSteganographyRoutes = require('../routes/videoSteganography');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files (uploads and output)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/output', express.static(path.join(__dirname, '../output')));

// API routes
app.use('/api/steganography', steganographyRoutes);
app.use('/api/video-steganography', videoSteganographyRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

module.exports = app; 