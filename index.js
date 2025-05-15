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

// Your real category IDs
const CATEGORY_MAJORS = 47;
const CATEGORY_MINORS = 48;
const CATEGORY_CORE = 50;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Oracle Relay Server Active.');
});

// =============================================
// Create Course - uses correct category IDs
// =============================================
app.post('/create_course', async (req, res) => {
  try {
    const { fullname, shortname, type, startdate, enddate, visible } = req.body;

    // Auto-set categoryid if not provided
    let categoryid;
    if (req.body.categoryid) {
      categoryid = req.body.categoryid;
    } else {
      if (type?.toLowerCase() === 'major') categoryid = CATEGORY_MAJORS;
      else if (type?.toLowerCase() === 'minor') categoryid = CATEGORY_MINORS;
      else if (type?.toLowerCase() === 'core') categoryid = CATEGORY_CORE;
      else categoryid = CATEGORY_MAJORS; // default fallback
    }

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

// =============================================
// Oracle Command - fully smart auto POST
// =============================================
app.post('/oracle_command', async (req, res) => {
  const { command, parameters } = req.body;

  try {
    if (!command) return res.status(400).json({ error: 'Missing command.' });

    const matchedFunction = moodleFunctions.find(func => func.function_name.toLowerCase() === command.toLowerCase());

    if (!matchedFunction) return res.status(404).json({ error: 'Command not found.' });

    const { function_name, method, format } = matchedFunction;

    let payload = {
      wstoken: MOODLE_TOKEN,
      wsfunction: function_name,
      moodlewsrestformat: 'json'
    };

    // Special auto-category assignment for course creation
    if (function_name === 'core_course_create_courses') {
      if (!parameters['courses[0][categoryid]']) {
        if (parameters.type?.toLowerCase() === 'major') parameters['courses[0][categoryid]'] = CATEGORY_MAJORS;
        else if (parameters.type?.toLowerCase() === 'minor') parameters['courses[0][categoryid]'] = CATEGORY_MINORS;
        else if (parameters.type?.toLowerCase() === 'core') parameters['courses[0][categoryid]'] = CATEGORY_CORE;
        else parameters['courses[0][categoryid]'] = CATEGORY_MAJORS; // fallback
      }
    }

    // Merge user parameters into payload
    if (format === 'form-encoded') {
      Object.keys(parameters).forEach(key => {
        payload[key] = parameters[key];
      });
    } else {
      payload = { ...payload, ...parameters };
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

// =============================================
// System Monitor
// =============================================
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

// =============================================
// Start Server
// =============================================
app.listen(PORT, () => {
  console.log(`Oracle Relay listening on port ${PORT}`);
});
