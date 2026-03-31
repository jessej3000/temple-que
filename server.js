const express = require('express');
const path = require('path');
const multer = require('multer');
const memoryStorage = multer.memoryStorage();
const upload = multer({ 
  storage: memoryStorage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});
const fs = require('fs');
const Mega = require('megajs');
require('dotenv').config();

const app = express();
const port = 3000;

// MEGA configuration
const megaEmail = process.env.MEGA_EMAIL;
const megaPassword = process.env.MEGA_PASSWORD;
const megaFolderName = process.env.MEGA_FOLDER;

let megaClient = null;
let megaFolder = null;

// Initialize MEGA client on startup
async function initializeMega() {
  try {
    console.log('Connecting to MEGA...');
    megaClient = new Mega({
      email: megaEmail,
      password: megaPassword
    });
    
    const files = await megaClient.getFiles();
    console.log('Connected to MEGA successfully');
    
    // Find or create the temple-que folder
    for (let file of Object.values(files)) {
      if (file.name === megaFolderName && file.directory) {
        megaFolder = file;
        console.log(`Found MEGA folder: ${megaFolderName}`);
        break;
      }
    }
    
    if (!megaFolder) {
      console.log(`MEGA folder "${megaFolderName}" not found. Files will be uploaded to root.`);
    }
  } catch (error) {
    console.error('Failed to initialize MEGA connection:', error.message);
  }
}

// Initialize MEGA on server start
initializeMega();

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
app.post('/upload-background', upload.single('background'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    if (!megaClient || !megaFolder) {
      return res.status(500).json({ success: false, error: 'MEGA connection not available' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'background-' + uniqueSuffix + path.extname(req.file.originalname);
    
    // Upload to MEGA
    const uploadedFile = await megaClient.upload(
      {
        name: filename,
        data: req.file.buffer
      },
      megaFolder
    ).complete;

    console.log('Background uploaded to MEGA:', filename);
    
    // Store file info for serving
    const fileInfo = {
      name: filename,
      type: req.file.mimetype,
      megaUrl: uploadedFile.downloadUrl
    };
    
    res.json({ 
      success: true, 
      url: uploadedFile.downloadUrl, 
      type: req.file.mimetype,
      filename: filename
    });
  } catch (error) {
    console.error('Background upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload to MEGA: ' + error.message });
  }
});

app.post('/upload-sound', upload.single('sound'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    if (!megaClient || !megaFolder) {
      return res.status(500).json({ success: false, error: 'MEGA connection not available' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'sound-' + uniqueSuffix + path.extname(req.file.originalname);
    
    // Upload to MEGA
    const uploadedFile = await megaClient.upload(
      {
        name: filename,
        data: req.file.buffer
      },
      megaFolder
    ).complete;

    console.log('Sound uploaded to MEGA:', filename);
    
    res.json({ 
      success: true, 
      url: uploadedFile.downloadUrl,
      filename: filename
    });
  } catch (error) {
    console.error('Sound upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload to MEGA: ' + error.message });
  }
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/control');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});