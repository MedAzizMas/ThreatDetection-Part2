const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();

// Increase payload limit and add detailed logging
app.use(express.json({ limit: '100mb' }));
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const SAVE_PATH = path.join(__dirname, '..', 'recordings');

if (!fs.existsSync(SAVE_PATH)) {
  fs.mkdirSync(SAVE_PATH);
  console.log('Created recordings directory at:', SAVE_PATH);
}

app.get('/', (req, res) => {
  console.log('Received GET request to root');
  res.send('Server is running!');
});

app.post('/save-audio', async (req, res) => {
  console.log('Received POST request to /save-audio');
  
  try {
    const { audio, filename } = req.body;
    const filePath = path.join(SAVE_PATH, filename);
    
    // Save the audio file
    const buffer = Buffer.from(audio, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    // Run transcription
    const python = spawn('python', ['transcribe.py', filePath]);
    let transcriptData = '';
    let threatResult = '';

    python.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Python output:', output);
      const lines = output.split('\n').filter(line => line.trim());
      if (lines.length >= 2) {
        transcriptData = lines[0];
        threatResult = lines[1];
      }
    });

    python.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    await new Promise((resolve, reject) => {
      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}`));
        } else {
          resolve();
        }
      });
    });

    console.log('Successfully saved file to:', filePath);
    res.json({ 
      success: true, 
      path: filePath,
      transcript: transcriptData,
      threatDetected: threatResult
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  const localIP = '192.168.68.187'; // Updated to correct IP from ipconfig
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server by visiting http://localhost:${PORT}`);
  console.log(`For local network access use http://${localIP}:${PORT}`);
});