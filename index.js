const express = require('express');
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Moodle API config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

// Load universal schema
const functionMap = JSON.parse(fs.readFileSync('./Moodle_Universal_Functions_Map.json', 'utf8'));

// Middleware
app.use(express.urlencoded({ extended: false, type: 'application/x-www-form-urlencoded' }));
app.use(express.json());

// Universal API Relay Endpoint
app.post('/oracle_command', async (req, res) => {
  try {
    const rawBody = req.body;
    const { command, ...params } = rawBody;

    if (!command) {
      return res.status(400).json({ error: 'Missing "command" field.' });
    }

    const fn = functionMap[command];
    if (!fn) {
      return res.status(400).json({ error: `Unknown command: ${command}` });
    }

    // Check for required parameters
    const missing = Object.keys(fn.parameters || {}).filter(p => !(p in params));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing parameters: ${missing.join(', ')}` });
    }

    // Proper payload without 'command'
    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: command,
      moodlewsrestformat: 'json',
      ...params
    };

    const response = await axios.post(
      MOODLE_URL,
      qs.stringify(payload, { encode: true }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json({
      status: 'success',
      command,
      moodleResponse: response.data
    });

  } catch (error) {
    console.error('Oracle Server Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      error: error.response?.data || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Oracle Moodle Relay running on port ${PORT}`);
});
