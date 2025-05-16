// ==========================
// FINAL ORACLE MOODLE SERVER
// ==========================

const express = require('express');
const axios = require('axios');
const qs = require('qs');
const app = express();
const PORT = process.env.PORT || 3000;

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
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`Oracle Moodle Server running on port ${PORT}`);
});
