// =======================
// ORACLE FINAL SERVER (AUTOMATED + FORMATTED)
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file support (optional)
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Oracle Smart Command
// =======================
app.post('/oracle_command', async (req, res) => {
  try {
    const { command, parameters } = req.body;

    if (!command || typeof parameters !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid command/parameters.' });
    }

    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: command,
      moodlewsrestformat: 'json'
    };

    // Flatten parameters including nested like users[0][key]
    for (const key in parameters) {
      if (key.includes('[')) {
        payload[key] = parameters[key];
      } else if (typeof parameters[key] === 'object' && Array.isArray(parameters[key])) {
        parameters[key].forEach((item, index) => {
          for (const subkey in item) {
            payload[`${key}[${index}][${subkey}]`] = item[subkey];
          }
        });
      } else {
        payload[key] = parameters[key];
      }
    }

    const response = await axios.post(
      MOODLE_URL,
      qs.stringify(payload),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    res.json({ message: `Successfully executed ${command}.`, moodleResponse: response.data });

  } catch (error) {
    console.error('Oracle Command Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Oracle Relay Server (Final) running on port ${PORT}`);
});
