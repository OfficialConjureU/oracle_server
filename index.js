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
// Oracle Smart Command (Fixed)
// =======================
app.post('/oracle_command', async (req, res) => {
  try {
    const { command, parameters } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Missing command field.' });
    }

    // Direct POST to Moodle
    const moodleURL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';

    const payload = {
      wstoken: '519f754c7dc83533788a2dd5872fe991',
      wsfunction: command,
      moodlewsrestformat: 'json',
      ...parameters
    };

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const response = await axios.post(
      moodleURL,
      qs.stringify(payload),
      axiosConfig
    );

    res.json({ message: 'Successfully executed command.', moodleResponse: response.data });
  } catch (error) {
    console.error('Oracle Command Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

    // Merge parameters into payload (flatten properly)
    if (parameters && typeof parameters === 'object') {
      Object.keys(parameters).forEach(key => {
        payload[key] = parameters[key];
      });
    }

    // Determine proper headers
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify(payload),
      axiosConfig
    );

    res.json({ message: `Command ${command} executed successfully.`, moodleResponse: moodleResponse.data });

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
