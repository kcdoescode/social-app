import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as postService from '../services/postService';

// Components
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Modal from '../components/Modal';

// Explore Feed Page
function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, isLoading: isAuthLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch posts once auth is ready
  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth context to finish loading

    const fetchPosts = async () => {
      if (!token) {
        setError('You must be logged in to see posts.');
        setIsFeedLoading(false);
        return;
      }
      try {
        setIsFeedLoading(true);
        setError('');
        const allPosts = await postService.getAllPosts(token);
        setPosts(allPosts);
      } catch (err) {
        setError(err.message || 'Failed to fetch posts.');
      } finally {
        setIsFeedLoading(false);
      }
    };

    fetchPosts();
  }, [token, isAuthLoading]);

  // Handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
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

  // Render middle feed content
  const renderContent = () => {
    if (isAuthLoading || isFeedLoading)
      return <div className="loading-spinner">Loading posts...</div>;

    if (error) return <div className="error-message">{error}</div>;

    if (posts.length === 0)
      return <div className="card"><p>No posts yet. Be the first to post!</p></div>;

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

  // Main layout
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

      <button className="floating-post-button" onClick={handleOpenModal}>
        +
      </button>
    </div>
  );
}

export default FeedPage;
