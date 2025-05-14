const express = require('express');
const axios = require('axios');
const path = require('path');
const qs = require('querystring');

const app = express(); // <<-- app must be defined first

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use(express.static(path.join(__dirname, 'public')));

// Root Route
app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active.');
});

// ✅ POST createCourse route
app.post('/createCourse', async (req, res) => {
  const { fullname, shortname, categoryid, startdate, enddate, visible } = req.body;

  try {
    const moodleResponse = await axios.post(
      'https://conjureuniversity.online/moodle/webservice/rest/server.php',
      qs.stringify({
        wstoken: '519f754c7dc83533788a2dd5872fe991',
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

// Start server
app.listen(PORT, () => {
  console.log(`Oracle Relay listening on port ${PORT}`);
});
