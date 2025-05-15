// =======================
// ORACLE FINAL SERVER (FULL DIRECT TO MOODLE)
// =======================

const express = require('express');
const axios = require('axios');
const path = require('path');
const qs = require('qs');

const app = express();
const PORT = process.env.PORT || 3000;

// Moodle Config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Root Test
// =======================
app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active.');
});

// =======================
// Oracle Smart Direct Command to Moodle
// =======================
app.post('/oracle_command', async (req, res) => {
  try {
    const { command, parameters } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Missing "command" field.' });
    }

    if (!parameters || typeof parameters !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid "parameters" field.' });
    }

    // Construct payload for Moodle
    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: command,
      moodlewsrestformat: 'json',
    };

    // Flatten parameters properly
    Object.keys(parameters).forEach(key => {
      payload[key] = parameters[key];
    });

    // Prepare axios config
    const axiosConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    // Send request to Moodle
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify(payload),
      axiosConfig
    );

    res.json({
      message: `Command "${command}" executed successfully.`,
      moodleResponse: moodleResponse.data
    });

  } catch (error) {
    console.error('Oracle Command Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`Oracle Relay Server listening on port ${PORT}`);
});
