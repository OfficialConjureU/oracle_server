// ==========================
// FINAL ORACLE MOODLE SERVER
// ==========================

const express = require('express');
const axios = require('axios');
const qs = require('qs');
const app = express();
const PORT = process.env.PORT || 3000;

// Moodle API config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Root Route
// ==========================
app.get('/', (req, res) => {
  res.send('Oracle Moodle Server: ACTIVE');
});

// ==========================
// Universal Oracle Command Handler
// ==========================
app.post('/oracle_command', async (req, res) => {
  try {
    const { command, parameters } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "command" field.' });
    }

    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: command,
      moodlewsrestformat: 'json',
      ...parameters
    };

    const response = await axios.post(
      MOODLE_URL,
      qs.stringify(payload),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    res.json({
      status: 'success',
      command,
      response: response.data
    });

  } catch (error) {
    console.error('Oracle Moodle Command Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      error: error.response?.data || error.message
    });
  }
});

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`Oracle Moodle Server running on port ${PORT}`);
});
