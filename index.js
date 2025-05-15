// =======================
// ORACLE FINAL SERVER (FULL AUTO - NO PREDICT, JUST FIRE)
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
  res.send('Oracle Relay Server Fully Active.');
});

// =======================
// Oracle Smart Command (NO PREDICTION, FULL SEND)
// =======================
app.post('/oracle_command', async (req, res) => {
  const { command, parameters } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Missing command field.' });
  }

  try {
    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: command,
      moodlewsrestformat: 'json',
      ...parameters
    };

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    // Directly POST without predicting or hesitating
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify(payload),
      axiosConfig
    );

    // Return Moodle's actual response to you
    res.json({
      status: 'Success',
      sentCommand: command,
      moodleResponse: moodleResponse.data
    });

  } catch (error) {
    console.error('Oracle Command Error:', error.response?.data || error.message);

    // Even if error happens, show it cleanly
    res.status(500).json({
      status: 'Error',
      sentCommand: command,
      moodleError: error.response?.data || error.message
    });
  }
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`Oracle Server now fully ACTIVE on port ${PORT}`);
});
