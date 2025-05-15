// =======================
// ORACLE FINAL SERVER (FLAT STRUCTURE, FULL MOODLE COMPLIANCE)
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
// Oracle Smart Command
// =======================
app.post('/oracle_command', async (req, res) => {
  try {
    let payload = req.body;

    // If the payload includes "command" and "parameters" keys, transform it properly
    if (payload.command && payload.parameters) {
      payload = {
        wstoken: MOODLE_TOKEN,
        wsfunction: payload.command,
        moodlewsrestformat: 'json',
        ...payload.parameters
      };
    } else if (!payload.wstoken) {
      // If wstoken is missing, add it
      payload.wstoken = MOODLE_TOKEN;
    }

    // Always make sure moodlewsrestformat is set
    payload.moodlewsrestformat = 'json';

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const response = await axios.post(
      MOODLE_URL,
      qs.stringify(payload),
      axiosConfig
    );

    res.json({ message: `Successfully executed ${payload.wsfunction}.`, moodleResponse: response.data });

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
