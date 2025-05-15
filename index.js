const express = require('express');
const axios = require('axios');
const path = require('path');
const qs = require('qs');
const moodleFunctions = require('./moodle_functions_fixed.json');

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
// Root Test
// =======================
app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active.');
});

// =======================
// Oracle Smart Command
// =======================
app.post('/oracle_command', async (req, res) => {
  const { command, parameters } = req.body;

  try {
    if (!command) {
      return res.status(400).json({ error: 'Missing command.' });
    }

    const matchedFunction = moodleFunctions.find(func => func.function_name.toLowerCase() === command.toLowerCase());

    if (!matchedFunction) {
      return res.status(404).json({ error: 'Command not found in Oracle function database.' });
    }

    const { function_name, method, format } = matchedFunction;

    let payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: function_name,
      moodlewsrestformat: 'json'
    };

    if (format === 'form-encoded') {
      Object.keys(parameters).forEach(key => {
        payload[key] = parameters[key];
      });
    } else {
      payload = {
        ...payload,
        ...parameters
      };
    }

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
// Legacy Routes (optional)
// =======================

// COURSES
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

// USERS
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
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// SYSTEM
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
