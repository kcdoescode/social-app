import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'react-feather';
import { useAuth } from '../context/AuthContext.jsx';
import * as postService from '../services/postService.js';

// Components
import Navbar from '../components/Navbar.jsx';
import PostCard from '../components/PostCard.jsx';
import CreatePostForm from '../components/CreatePostForm.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import Modal from '../components/Modal.jsx';

// Following Feed Page
function FollowingFeedPage() {
  const [posts, setPosts] = useState([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { token, isLoading: isAuthLoading } = useAuth();

  //Fetch following posts once auth is ready
  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth state

    const fetchPosts = async () => {
      if (!token) {
        setError('You must be logged in to see posts.');
        setIsFeedLoading(false);
        return;
      }

      try {
        setIsFeedLoading(true);
        setError('');
        const allPosts = await postService.getFollowingPosts(token);
        setPosts(allPosts);
      } catch (err) {
        setError(err.message || 'Failed to fetch posts.');
      } finally {
        setIsFeedLoading(false);
      }
    };

    fetchPosts();
  }, [token, isAuthLoading]);

  //Handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]); // Add new post to the top
    setIsModalOpen(false);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post =>
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(currentPosts =>
      currentPosts.filter(post => post._id !== deletedPostId)
    );
  };

  //Render logic
  const renderContent = () => {
    if (isAuthLoading || isFeedLoading)
      return <div className="loading-spinner">Loading posts...</div>;

    if (error)
      return <div className="error-message">{error}</div>;

    if (posts.length === 0) {
      return (
        <div className="card empty-feed-card">
          <h2>Your Following Feed is Quiet</h2>
          <p>You aren’t following anyone yet. Here’s how to find people:</p>
          <ol className="empty-feed-steps">
            <li>Go to the <strong>Explore</strong> page.</li>
            <li>Find a post you like? Click the user’s name or avatar.</li>
            <li>On their profile, tap <strong>Follow</strong>.</li>
          </ol>
          <Link to="/" className="button primary empty-feed-button">
            <Compass size={18} />
            <span>Go to Explore</span>
          </Link>
        </div>
      );
    }

    return (
      <div className="post-list">
        {posts.map(post => (
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

  //Page Layout
  return (
    <div className="page-container-v2">
      <Navbar />

      <main className="app-layout">
        <LeftSidebar onPostClick={handleOpenModal} />
        <div className="feed-column">{renderContent()}</div>
        <RightSidebar />
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title="Create Post"
      >
        <CreatePostForm onPostCreated={handlePostCreated} />
      </Modal>

      <button
        className="floating-post-button"
        onClick={handleOpenModal}
      >
        +
      </button>
    </div>
  );
}

export default FollowingFeedPage;
