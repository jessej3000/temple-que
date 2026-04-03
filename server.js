const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3000;

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv',
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limit
  }
});

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control.html'));
});

app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

app.get('/monitoring', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

// Check if file exists
app.get('/check-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'uploads', filename);
  if (require('fs').existsSync(filePath)) {
    const mimeType = getMimeType(filename);
    res.json({ exists: true, url: `/uploads/${filename}`, type: mimeType });
  } else {
    res.json({ exists: false });
  }
});

// File upload endpoint
app.post('/upload-background', upload.single('background'), (req, res) => {
  if (req.file) {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, type: req.file.mimetype });
  } else {
    res.status(400).json({ success: false, error: 'No file uploaded' });
  }
});

app.post('/upload-sound', upload.single('sound'), (req, res) => {
  if (req.file) {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
  } else {
    res.status(400).json({ success: false, error: 'No file uploaded' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/control');
});

app.listen(port, () => {
  console.log(`Control page http://localhost:${port}/control`);
  console.log(`Display page http://localhost:${port}/display`);
  console.log(`Monitoring page http://localhost:${port}/monitoring`);
  console.log(`:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::`);
  console.log(`TO CLOSE THE APP: Press Ctrl+C in the terminal`);
  console.log(`App listening at http://localhost:${port}`);
});