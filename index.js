const express = require('express');
const axios = require('axios');
const path = require('path');
const qs = require('qs'); // important! use qs instead of querystring

const app = express();
const PORT = process.env.PORT || 3000;

// Moodle Config
const MOODLE_URL = 'https://conjureuniversity.online/moodle/webservice/rest/server.php';
const MOODLE_TOKEN = '519f754c7dc83533788a2dd5872fe991';

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
app.post('/createCourse', async (req, res) => {
  const { fullname, shortname, categoryid, startdate, enddate, visible } = req.body;

  try {
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify({
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_course_create_courses',
        moodlewsrestformat: 'json',
        'courses[0][fullname]': fullname,
        'courses[0][shortname]': shortname,
        'courses[0][categoryid]': categoryid,
        'courses[0][summary]': 'A mystical trial course created for testing and calibration.', // optional but recommended
        'courses[0][startdate]': startdate,
        'courses[0][enddate]': enddate,
        'courses[0][visible]': visible
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
