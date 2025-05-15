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
// Oracle Smart Autonomous Command
// =======================
app.post('/oracle_command', async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Missing task field. Please describe the action you want.' });
    }

    // Try to intelligently understand the request
    const lowerTask = task.toLowerCase();

    if (lowerTask.includes('create a user')) {
      // Extract name and email
      const nameMatch = task.match(/create a user\s+(.*?)\s+([^\s]+@[^\s]+)/i);
      if (!nameMatch) {
        return res.status(400).json({ error: 'Could not parse user creation details. Please provide full name and email.' });
      }
      
      const fullname = nameMatch[1];
      const email = nameMatch[2];
      const [firstname, ...lastnameParts] = fullname.split(' ');
      const lastname = lastnameParts.join(' ') || 'Unknown';
      const username = email.split('@')[0].toLowerCase();

      const payload = {
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_user_create_users',
        moodlewsrestformat: 'json',
        'users[0][username]': username,
        'users[0][password]': 'Welcome2025!',
        'users[0][firstname]': firstname,
        'users[0][lastname]': lastname,
        'users[0][email]': email,
        'users[0][auth]': 'manual',
        'users[0][lang]': 'en',
        'users[0][timezone]': 'America/Chicago',
        'users[0][maildisplay]': 1
      };

      const axiosConfig = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      };

      const moodleResponse = await axios.post(
        MOODLE_URL,
        qs.stringify(payload),
        axiosConfig
      );

      return res.json({ message: `User ${firstname} ${lastname} created successfully.`, moodleResponse: moodleResponse.data });
    } else {
      return res.status(400).json({ error: 'Unsupported task. Oracle only understands "create a user" commands at this time.' });
    }

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
