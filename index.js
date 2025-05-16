const express = require('express');
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Moodle API Config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

// Load function map schema (should map each function to its expected param structure)
const functionMap = JSON.parse(fs.readFileSync('./Moodle_Universal_Functions_Map.json', 'utf8'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Universal Oracle Command Handler
app.post('/oracle_command', async (req, res) => {
  try {
    const { command, ...rawParams } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Missing "command" field.' });
    }

    const expectedFormat = functionMap[command];
    if (!expectedFormat) {
      return res.status(400).json({ error: `Unknown Moodle function: ${command}` });
    }

    // Build payload using raw body to preserve bracketed keys if needed
    const payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: command,
      moodlewsrestformat: 'json',
      ...rawParams
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

app.listen(PORT, () => {
  console.log(`✅ Oracle Moodle Relay running on port ${PORT}`);
});
