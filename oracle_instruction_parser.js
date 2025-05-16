module.exports = function parseInstruction(command) {
  if (command.toLowerCase().includes('create a user')) {
    const nameMatch = command.match(/named\s(.+?)\swith/i);
    const emailMatch = command.match(/email\s([\w.-]+@[\w.-]+)/i);

    const nameParts = nameMatch?.[1]?.split(' ') || [];
    const email = emailMatch?.[1] || '';
    const username = email.split('@')[0];

    return {
      wsfunction: 'core_user_create_users',
      parameters: {
        'users[0][username]': username,
        'users[0][password]': 'Welcome2025!',
        'users[0][firstname]': nameParts[0] || 'First',
        'users[0][lastname]': nameParts[1] || 'Last',
        'users[0][email]': email,
        'users[0][auth]': 'manual',
        'users[0][lang]': 'en',
        'users[0][timezone]': 'America/Chicago',
        'users[0][maildisplay]': 1
      }
    };
  }

  // Fallback if command doesn't match any known type
  return { wsfunction: null, parameters: null };
};
