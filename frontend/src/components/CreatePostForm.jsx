import React, { useState } from 'react';
import * as postService from '../services/postService.js';
import { useAuth } from '../context/AuthContext.jsx';

function CreatePostForm({ onPostCreated }) {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, token } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !imageUrl) {
      setError('You must include either text or an image URL.');
      return;
    }
    if (!token) {
      setError('You must be logged in to post.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newPost = await postService.createPost({ text, imageUrl }, token);
      
      // This will add the new post to the feed instantly
      onPostCreated(newPost);

      // Clear the form
      setText('');
      setImageUrl('');
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      {error && <p className="error-message">{error}</p>}
      
      <textarea
        className="post-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        rows="3"
      />

      <input
        type="text"
        className="post-image-input"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Paste direct image URL (.png or .jpg)"
      />
      <p className="image-url-guide">
        Find a direct URL by right-clicking an image on Google and choosing "Copy Image Address".
      </p>

      <button type="submit" className="button primary" disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}

export default CreatePostForm;