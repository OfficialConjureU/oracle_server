// ==========================
// FINAL ORACLE MOODLE SERVER
// ==========================

const express = require('express');
const axios = require('axios');
const qs = require('qs');
const app = express();
const PORT = process.env.PORT || 3000;
const parseInstruction = require('./oracle_instruction_parser');

// Moodle API config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

app.use(express.json());

// ==========================
// Root Route
// ==========================
app.get('/', (req, res) => {
  res.send('Oracle Moodle Server: ACTIVE');
});

// ==========================
// Create User Direct
// ==========================
app.post('/create_user', async (req, res) => {
  try {
    const user = req.body;

    // Flatten user fields to Moodle's required format
    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: 'core_user_create_users',
      moodlewsrestformat: 'json',
      'users[0][username]': user.username,
      'users[0][password]': user.password || 'Welcome2025!',
      'users[0][firstname]': user.firstname,
      'users[0][lastname]': user.lastname,
      'users[0][email]': user.email,
      'users[0][auth]': user.auth || 'manual',
      'users[0][lang]': user.lang || 'en',
      'users[0][timezone]': user.timezone || 'America/Chicago',
      'users[0][maildisplay]': user.maildisplay ?? 1
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
      message: `User ${user.firstname} ${user.lastname} created.`,
      moodleResponse: response.data
    });
  } catch (err) {
    console.error('Error creating user:', err.response?.data || err.message);
    res.status(500).json({
      status: 'error',
      error: err.response?.data || err.message
    });
  }
});
// ==========================
// Smart Oracle Instruction Endpoint
// ==========================
app.post('/oracle_command', async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid command string.' });
    }

    const { wsfunction, parameters } = parseInstruction(command);

    if (!wsfunction || !parameters) {
      return res.status(400).json({ error: 'Unable to parse command into Moodle function.' });
    }

    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction,
      moodlewsrestformat: 'json',
      ...parameters
    };

    const axiosConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify(payload),
      axiosConfig
    );

    res.json({
      message: `Successfully executed ${wsfunction}.`,
      moodleResponse: moodleResponse.data
    });

  } catch (err) {
    console.error('Oracle command error:', err.message);
    res.status(500).json({
      error: 'Internal error processing command.',
      details: err.message
    });
  }
});

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`Oracle Moodle Server running on port ${PORT}`);
});
