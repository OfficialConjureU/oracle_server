// =======================
// ORACLE FINAL SERVER (FULL AUTOEXECUTE DIRECT TO MOODLE)
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

// Full Autoexecute Mode
const directExecutionEnabled = true;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (Optional)
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Root Test
// =======================
app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active — AutoExecute Enabled.');
});

// =======================
// Oracle Smart Command
// =======================
app.post('/oracle_command', async (req, res) => {
  try {
    const { command, parameters } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Missing command field.' });
    }

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

    if (directExecutionEnabled) {
      const response = await axios.post(
        MOODLE_URL,
        qs.stringify(payload),
        axiosConfig
      );

      return res.json({
        message: `✅ Oracle Auto-Executed Command: ${command}`,
        moodleResponse: response.data
      });
    } else {
      // Old mode (not used anymore)
      return res.json({
        message: '⚡ Oracle would have executed this, but AutoExecution is OFF.',
        curlExample: {
          url: MOODLE_URL,
          headers: axiosConfig.headers,
          payload: payload
        }
      });
    }

  } catch (error) {
    console.error('Oracle AutoCommand Error:', error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`🔮 Oracle Relay Server listening on port ${PORT} — AutoExecute ON.`);
});
