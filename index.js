const express = require('express');
const axios = require('axios');
const path = require('path');
const qs = require('qs'); // Correct qs usage

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

// =======================
// Test Root
// =======================
app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active.');
});

// =======================
// COURSES (form-encoded)
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
        'courses[0][summary]': 'Auto-created by Oracle.',
        'courses[0][startdate]': startdate,
        'courses[0][enddate]': enddate,
        'courses[0][visible]': visible
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    console.error('Error creating course:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// USERS (form-encoded)
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
    res.json({ message: 'User created directly in Moodle.', moodleResponse: moodleResponse.data });
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to create user in Moodle.', error: error.response?.data || error.message });
  }
});

// =======================
// GROUPS (application/json)
// =======================
app.post('/create_group', async (req, res) => {
  const { courseid, name, description } = req.body;
  try {
    const moodleResponse = await axios.post(
      `${MOODLE_URL}?wstoken=${MOODLE_TOKEN}&wsfunction=core_group_create_groups&moodlewsrestformat=json`,
      {
        groups: [
          { courseid, name, description }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    console.error('Error creating group:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.post('/add_user_to_group', async (req, res) => {
  const { groupid, userid } = req.body;
  try {
    const moodleResponse = await axios.post(
      `${MOODLE_URL}?wstoken=${MOODLE_TOKEN}&wsfunction=core_group_add_group_members&moodlewsrestformat=json`,
      {
        members: [
          { groupid, userid }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    console.error('Error adding user to group:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// COHORTS (application/json)
// =======================
app.post('/create_cohort', async (req, res) => {
  const { name, description, categoryid } = req.body;
  try {
    const moodleResponse = await axios.post(
      `${MOODLE_URL}?wstoken=${MOODLE_TOKEN}&wsfunction=core_cohort_create_cohorts&moodlewsrestformat=json`,
      {
        cohorts: [
          { name, description, categorytype: 'id', categoryid }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    console.error('Error creating cohort:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.post('/add_user_to_cohort', async (req, res) => {
  const { cohortid, userid } = req.body;
  try {
    const moodleResponse = await axios.post(
      `${MOODLE_URL}?wstoken=${MOODLE_TOKEN}&wsfunction=core_cohort_add_cohort_members&moodlewsrestformat=json`,
      {
        members: [
          { cohortid, userid }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    console.error('Error adding user to cohort:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// ASSIGNMENTS (application/json)
// =======================
app.post('/create_assignment', async (req, res) => {
  const { courseid, name, description, duedate } = req.body;
  try {
    const moodleResponse = await axios.post(
      `${MOODLE_URL}?wstoken=${MOODLE_TOKEN}&wsfunction=mod_assign_create_assignments&moodlewsrestformat=json`,
      {
        assignments: [
          { courseid, name, intro: description, duedate }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(moodleResponse.data);
  } catch (error) {
    console.error('Error creating assignment:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// MESSAGING (form-encoded)
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
    console.error('Error sending message:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// =======================
// SYSTEM MONITORING
// =======================
app.get('/get_server_status', (req, res) => {
  res.json({ status: "Oracle Server Online." });
});

app.get('/monitor_server_load', (req, res) => {
  const os = require('os');
  res.json({
    loadavg: os.loadavg(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    uptime: os.uptime()
  });
});

app.post('/trigger_manual_backup', (req, res) => {
  res.json({ message: "Manual backup trigger not implemented yet." });
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`Oracle Relay listening on port ${PORT}`);
});
