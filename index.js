// =======================
// ORACLE FINAL SERVER (FULL INTELLIGENT AUTONOMOUS MODE)
// =======================

const express = require('express');
const axios = require('axios');
const qs = require('qs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Moodle Config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Root Test
// =======================
app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active.');
});

// =======================
// Oracle Smart Command (Fixed Version)
// =======================
app.post('/oracle_command', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.command) {
      return res.status(400).json({ error: 'Missing command field.' });
    }

    // Build the outgoing payload
    const outgoingPayload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: payload.command,
      moodlewsrestformat: 'json'
    };

    // Merge all additional keys into outgoingPayload
    for (const key in payload) {
      if (key !== 'command') {
        outgoingPayload[key] = payload[key];
      }
    }

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const response = await axios.post(
      MOODLE_URL,
      qs.stringify(outgoingPayload),
      axiosConfig
    );

    res.json({ message: `Successfully executed ${payload.command}.`, moodleResponse: response.data });

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
