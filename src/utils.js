export function getCookieValue(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    // Does this cookie string begin with the name we want?
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }

  // If cookie not found, generate a new one, set it, and return it.
  if (name === 'session_id') {
    const newSessionId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
    // Set the cookie to expire in 7 days, adjust as needed
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${newSessionId}; expires=${expires}; path=/`;
    return newSessionId;
  }

  return ''; // Return empty string if other cookies not found
} 