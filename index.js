const express = require('express');
const axios = require('axios');
const path = require('path');
const qs = require('querystring');

const app = express();
const PORT = process.env.PORT || 3000;

// Moodle Config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991'; // your real token

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use(express.static(path.join(__dirname, 'public')));

// Test root
app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active.');
});

// Create Course
app.post('/create_course', async (req, res) => {
  const { fullname, shortname, categoryid, startdate, enddate, visible } = req.body;

  try {
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify({
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_course_create_courses',
        moodlewsrestformat: 'json',
        courses: JSON.stringify([
          {
            fullname,
            shortname,
            categoryid,
            startdate,
            enddate,
            visible
          }
        ])
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    console.log('Moodle API Response:', moodleResponse.data);
    res.json({ message: 'Course creation relayed successfully.', moodleResponse: moodleResponse.data });

  } catch (error) {
    console.error('Error forwarding to Moodle:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to create course via Moodle.', error: error.response?.data || error.message });
  }
});

// Start the app
app.listen(PORT, () => {
  console.log(`Oracle Relay listening on port ${PORT}`);
});
