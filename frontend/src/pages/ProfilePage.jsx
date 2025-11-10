import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import * as postService from '../services/postService';
import { ArrowLeft, Edit, Settings, Bookmark, Info, LogOut } from 'react-feather';

// Reusable components
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Modal from '../components/Modal';
import CreatePostForm from '../components/CreatePostForm';

function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, user, logout, followingList, toggleFollow } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Ensure consistent string IDs
  const currentUserIdStr = user ? String(user.id || user._id) : null;
  const profileUserIdStr = String(userId);

  // Fetch profile data and user posts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token || !profileUserIdStr) return;
      setIsLoading(true);
      setError('');
      try {
        const [profileData, postsData] = await Promise.all([
          userService.getUserProfile(profileUserIdStr, token),
          postService.getPostsByUser(profileUserIdStr, token)
        ]);
        setProfile(profileData);
        setPosts(postsData);
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [profileUserIdStr, token]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(current => current.filter(post => post._id !== deletedPostId));
  };

  const handlePostCreated = (newPost) => {
    const postAuthorId = String(newPost.user?._id || newPost.user?.id);
    if (postAuthorId === profileUserIdStr) {
      setPosts([newPost, ...posts]);
    }
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Follow logic
  const isFollowingThisUser = followingList.includes(profileUserIdStr);
  const handleFollowToggle = () => {
    toggleFollow(profileUserIdStr);
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        followersCount: isFollowingThisUser
          ? prev.followersCount - 1
          : prev.followersCount + 1
      };
    });
  };

  // Render
  const renderProfileContent = () => {
    if (isLoading) return <div className="loading-spinner">Loading profile...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!profile) return <div className="error-message">User not found.</div>;

    const isOwnProfile = currentUserIdStr === profileUserIdStr;

    return (
      <>
        <button className="profile-back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>

        <div className="card profile-header">
          {isOwnProfile && (
            <div className="profile-menu-wrapper" ref={menuRef}>
              <button
                className="profile-menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Settings size={20} />
              </button>

              {isMenuOpen && (
                <div className="profile-menu">
                  <ul>
                    <li><Link to="/account/edit"><Edit size={16} /><span>Edit Profile</span></Link></li>
                    <li><Link to="/saved"><Bookmark size={16} /><span>Saved Posts</span></Link></li>
                    <li><Link to="/about"><Info size={16} /><span>About Social</span></Link></li>
                    <li><button onClick={handleLogout} className="logout-button"><LogOut size={16} /><span>Logout</span></button></li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {profile.profilePictureUrl && (
            <img src={profile.profilePictureUrl} alt="" className="avatar-large" />
          )}
          <h2>{profile.username}</h2>
          {profile.bio && <span className="profile-bio">{profile.bio}</span>}
          <p>Joined: {formatJoinDate(profile.createdAt)}</p>

          <div className="profile-stats-container">
            <div className="profile-stat">
              <strong>{profile.postsCount}</strong>
              <span>Posts</span>
            </div>
            <div className="profile-stat">
              <strong>{profile.followersCount}</strong>
              <span>Followers</span>
            </div>
            <div className="profile-stat">
              <strong>{profile.followingCount}</strong>
              <span>Following</span>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="profile-action-button">
              <button
                className={`button ${isFollowingThisUser ? 'secondary' : 'primary'}`}
                onClick={handleFollowToggle}
              >
                {isFollowingThisUser ? 'Following' : 'Follow'}
              </button>
            </div>
          )}
        </div>

        <div className="profile-posts-list">
          <h3>Posts</h3>
          {posts.length > 0 ? (
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
          ) : (
            <div className="card">
              <p>{profile.username} hasn’t posted anything yet.</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="page-container-v2">
      <Navbar />

      <main className="app-layout">
        <LeftSidebar onPostClick={() => setIsModalOpen(true)} />
        <div className="feed-column">{renderProfileContent()}</div>
        <RightSidebar />
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Post"
      >
        <CreatePostForm onPostCreated={handlePostCreated} />
      </Modal>

      <button className="floating-post-button" onClick={() => setIsModalOpen(true)}>
        +
      </button>
    </div>
  );
}

export default ProfilePage;
