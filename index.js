// =======================
// ORACLE FINAL SERVER (FULL)
// =======================

const express = require('express');
const axios = require('axios');
const path = require('path');
const qs = require('qs');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Moodle Config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

// Load full Moodle API functions
const moodleFunctions = require('./moodle_functions_fixed.json');

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
// Smart Oracle Command
// =======================
app.post('/oracle_command', async (req, res) => {
  const { command, parameters } = req.body;

  try {
    if (!command) {
      return res.status(400).json({ error: 'Missing command field.' });
    }

    const matchedFunction = moodleFunctions.find(func => func.function_name.toLowerCase() === command.toLowerCase());

    if (!matchedFunction) {
      return res.status(404).json({ error: 'Command not found in Oracle Moodle database.' });
    }

    const { function_name, method, format } = matchedFunction;

    // Base Payload
    let payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: function_name,
      moodlewsrestformat: 'json'
    };

    // Merge user parameters
    if (parameters && typeof parameters === 'object') {
      if (format === 'form-encoded') {
        Object.keys(parameters).forEach(key => {
          payload[key] = parameters[key];
        });
      } else {
        payload = { ...payload, ...parameters };
      }
    }

    // Fill in any default parameters from moodle_functions_fixed.json
    if (matchedFunction.default_parameters) {
      for (const [key, value] of Object.entries(matchedFunction.default_parameters)) {
        if (!payload.hasOwnProperty(key)) {
          payload[key] = value;
        }
      }
    }

    // Determine proper headers
    const axiosConfig = {
      headers: {
        'Content-Type': format === 'form-encoded' ? 'application/x-www-form-urlencoded' : 'application/json'
      }
    };

    const moodleResponse = await axios.post(
      MOODLE_URL,
      format === 'form-encoded' ? qs.stringify(payload) : payload,
      axiosConfig
    );

    res.json({ message: `Command ${function_name} executed successfully.`, moodleResponse: moodleResponse.data });

  } catch (error) {
    console.error('Oracle command error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`Oracle Relay listening on port ${PORT}`);
});
