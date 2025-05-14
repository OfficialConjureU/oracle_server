const express = require('express');
const axios = require('axios');
const path = require('path');
const qs = require('qs'); // IMPORTANT: Use qs, not querystring

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

// Test Root
app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active.');
});

// =======================
// Courses Section
// =======================

app.post('/create_course', async (req, res) => {
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
        'courses[0][summary]': 'Course created by Oracle.',
        'courses[0][startdate]': startdate,
        'courses[0][enddate]': enddate,
        'courses[0][visible]': visible
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.post('/update_course', async (req, res) => {
  const { courseid, fullname, shortname, visible } = req.body;
  try {
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify({
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_course_update_courses',
        moodlewsrestformat: 'json',
        'courses[0][id]': courseid,
        'courses[0][fullname]': fullname,
        'courses[0][shortname]': shortname,
        'courses[0][visible]': visible
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.post('/duplicate_course', async (req, res) => {
  const { courseid, fullname, shortname, categoryid } = req.body;
  try {
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify({
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_course_duplicate_course',
        moodlewsrestformat: 'json',
        courseid,
        fullname,
        shortname,
        categoryid
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.post('/delete_course', async (req, res) => {
  const { courseid } = req.body;
  try {
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify({
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_course_delete_courses',
        moodlewsrestformat: 'json',
        courseids: [courseid]
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// Users Section
// =======================

app.post('/create_user', async (req, res) => {
  const { firstname, lastname, email, username, password } = req.body;
  try {
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify({
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_user_create_users',
        moodlewsrestformat: 'json',
        'users[0][username]': username,
        'users[0][password]': password,
        'users[0][firstname]': firstname,
        'users[0][lastname]': lastname,
        'users[0][email]': email,
        'users[0][auth]': 'manual',
        'users[0][lang]': 'en',
        'users[0][timezone]': 'America/Chicago',
        'users[0][maildisplay]': 1
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// (Additional User Routes like update_user, suspend_user, delete_user can be added here.)

// =======================
// Roles Section
// =======================

app.post('/assign_role', async (req, res) => {
  const { userid, roleid, contextid } = req.body;
  try {
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify({
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_role_assign_roles',
        moodlewsrestformat: 'json',
        'assignments[0][roleid]': roleid,
        'assignments[0][userid]': userid,
        'assignments[0][contextid]': contextid
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// Messaging Section
// =======================

app.post('/send_message', async (req, res) => {
  const { touserid, text } = req.body;
  try {
    const moodleResponse = await axios.post(
      MOODLE_URL,
      qs.stringify({
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_message_send_instant_messages',
        moodlewsrestformat: 'json',
        'messages[0][touserid]': touserid,
        'messages[0][text]': text,
        'messages[0][textformat]': 1
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// System Monitoring Section
// =======================

app.get('/get_server_status', async (req, res) => {
  res.json({ status: "Oracle Server Online." });
});

app.get('/monitor_server_load', async (req, res) => {
  const os = require('os');
  res.json({
    loadavg: os.loadavg(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    uptime: os.uptime()
  });
});

app.post('/trigger_manual_backup', async (req, res) => {
  res.json({ message: "Manual backup trigger not implemented yet. (Optional future extension)" });
});

// =======================
// Start the app
// =======================

app.listen(PORT, () => {
  console.log(`Oracle Relay listening on port ${PORT}`);
});
