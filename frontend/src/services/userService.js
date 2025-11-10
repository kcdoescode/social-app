const BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function fetchWithAuth(url, options = {}) {
  const config = {
    ...options,
    cache: 'no-store', 
    headers: {
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.ok) {
      if (response.status === 204) {
        return { message: 'Success' };
      }
      return await response.json(); 
    }

    const errorText = await response.text();
    let errorData = { message: errorText };
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
    }
    
    const error = new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;

  } catch (err) {
    console.error("fetchWithAuth error:", err.message);
    throw err; 
  }
}



export const getUserProfile = async (userId, token) => {
  return fetchWithAuth(`${BASE_URL}/users/profile/${userId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const getMyProfile = async (token) => {
  return fetchWithAuth(`${BASE_URL}/users/profile`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const updateMyProfile = async (profileData, token) => {
  // profileData is an object: { username, bio }
  return fetchWithAuth(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
};



export const toggleFollowUser = async (userId, token) => {
  return fetchWithAuth(`${BASE_URL}/users/${userId}/follow`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};