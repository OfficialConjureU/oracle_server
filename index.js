const express = require('express');
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Moodle API Config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

// Load universal function map
const functionMap = JSON.parse(fs.readFileSync('./Moodle_Universal_Functions_Map.json', 'utf8'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Universal Oracle Relay Handler
// ==========================
app.post('/oracle_command', async (req, res) => {
  try {
    const { command, ...params } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Missing "command" field.' });
    }

    const fnData = functionMap[command];
    if (!fnData) {
      return res.status(400).json({ error: `Unrecognized Moodle function: ${command}` });
    }

    const requiredParams = fnData.parameters || {};
    const missing = Object.keys(requiredParams).filter(p => !(p in params));
    if (missing.length) {
      return res.status(400).json({ error: `Missing required parameters: ${missing.join(', ')}` });
    }

    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: command,
      moodlewsrestformat: 'json',
      ...params
    };

    const response = await axios.post(
      MOODLE_URL,
      qs.stringify(payload),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json({
      status: 'success',
      command,
      moodleResponse: response.data
    });

  } catch (error) {
    console.error('Oracle Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Oracle Moodle Server running on port ${PORT}`);
});
