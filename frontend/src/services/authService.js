// Get the API base URL from the environment variable we created
const API_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Sends a login request to the backend.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} The server's response.
 */
const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;

  } catch (error) {
    throw error;
  }
};

/**
 * //Sends a signup request to the backend.
 * @param {string} username //The new user's username.
 * @param {string} email //The new user's email.
 * @param {string} password //The new user's password.
 * @returns {Promise<object>} //The server's response.
 */
const signup = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    return data;

  } catch (error) {
    throw error;
  }
};

// Export the functions in an object
const authService = {
  login,
  signup,
};

export default authService;
