const BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

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



export const search = async (query, token) => {
  return fetchWithAuth(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
