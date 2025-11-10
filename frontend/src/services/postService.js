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
        return { message: 'Deleted successfully' };
      }
      return await response.json(); 
    }

    // If the response is not ok, build a helpful error message
    const errorText = await response.text();
    let errorData = { message: errorText };
    try {
      errorData = JSON.parse(errorText); // See if the error is a JSON object
    } catch (e) {
      // It wasn't JSON, just use the raw text
    }
    
    const error = new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;

  } catch (err) {
    console.error("fetchWithAuth error:", err.message);
    throw err; 
  }
}



export const getAllPosts = async (token) => {
  return fetchWithAuth(`${BASE_URL}/posts`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const getFollowingPosts = async (token) => {
  return fetchWithAuth(`${BASE_URL}/posts/following`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const createPost = async (postData, token) => {
  // postData is { text, imageUrl }
  return fetchWithAuth(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(postData)
  });
};


export const likePost = async (postId, token) => {
  return fetchWithAuth(`${BASE_URL}/posts/${postId}/like`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const commentOnPost = async (postId, text, token) => {
  return fetchWithAuth(`${BASE_URL}/posts/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });
};


export const getPostsByUser = async (userId, token) => {
  return fetchWithAuth(`${BASE_URL}/posts/user/${userId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const deletePost = async (postId, token) => {
  return fetchWithAuth(`${BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const deleteComment = async (postId, commentId, token) => {
  return fetchWithAuth(`${BASE_URL}/posts/${postId}/comment/${commentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const savePost = async (postId, token) => {
  return fetchWithAuth(`${BASE_URL}/posts/${postId}/save`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};


export const getSavedPosts = async (token) => {
  return fetchWithAuth(`${BASE_URL}/posts/saved`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

