const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
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
  console.log(`App listening at http://localhost:${port}`);
});