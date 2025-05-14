// Create Course (duplicate for GPT compatibility)
app.post('/createCourse', async (req, res) => {
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
