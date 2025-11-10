import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as postService from '../services/postService.js';

import Navbar from '../components/Navbar.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import Modal from '../components/Modal.jsx';
import CreatePostForm from '../components/CreatePostForm.jsx';
import PostCard from '../components/PostCard.jsx'; 

import '../styles/SavedPosts.css';

function SavedPostsPage() {
  const { token } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // Fetch all saved posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const data = await postService.getSavedPosts(token);
        setSavedPosts(data);
      } catch (err) {
        setError(err.message || 'Failed to load saved posts.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSavedPosts();
  }, [token]);

  // This handler is passed to PostCard to update likes
  const handlePostUpdated = (updatedPost) => {
    setSavedPosts(savedPosts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDeleted = (deletedPostId) => {
    setSavedPosts(savedPosts.filter(post => post._id !== deletedPostId));
  };

  const handlePostUnsaved = (postId) => {
    setSavedPosts(savedPosts.filter(post => post._id !== postId));
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-spinner">Loading saved posts...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    if (savedPosts.length === 0) {
      return <div className="no-saved-posts">You have no saved posts.</div>;
    }
    return (
      <div className="post-list">
        {savedPosts.map(post => (
          <PostCard 
            key={post._id} 
            post={post} 
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
            
          />
        ))}
      </div>
    );
  };

  return (
    <div className="page-container-v2"> 
      <Navbar />
      
      <main className="app-layout">
        
        <LeftSidebar onPostClick={() => setIsModalOpen(true)} />
        
        <div className="feed-column">
          <div className="card saved-posts-header">
            <h2>Saved Posts</h2>
            <p>Your collection of saved posts. Only you can see this.</p>
          </div>
          {renderContent()}
        </div>
        
        <RightSidebar />

      </main>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Post"
      >
        <CreatePostForm onPostCreated={() => setIsModalOpen(false)} />
      </Modal>

      <button
        className="floating-post-button"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>
      
    </div>
  );
}

export default SavedPostsPage;
