import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as userService from '../services/userService.js';

// Import reusable components
import Navbar from '../components/Navbar.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import Modal from '../components/Modal.jsx'; 
import CreatePostForm from '../components/CreatePostForm.jsx';

// Import the new, separate CSS file for this page
import '../styles/EditProfile.css';

function EditProfilePage() {
  const { token, user, login } = useAuth(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', bio: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // Fetch the user's current profile data to pre-fill the form
  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const myProfile = await userService.getMyProfile(token);
        setFormData({
          username: myProfile.username,
          bio: myProfile.bio || '' // Set bio to empty string if it's null
        });
      } catch (err) {
        setError(err.message || 'Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { user: updatedUser, token: newToken } = await userService.updateMyProfile(formData, token);
      
      // Update the user's info in the AuthContext
      // call 'login' with the new token so the app state (e.g., username) is updated everywhere
      login(newToken); 

      setSuccess('Profile updated successfully!');
      
      //  Redirect back to the profile page after a short delay
      setTimeout(() => {
        navigate(`/profile/${updatedUser._id}`);
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const renderForm = () => {
    if (isLoading) {
      return <div className="loading-spinner">Loading Profile...</div>;
    }
    
    return (
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="avatar-preview">
          <img
            src={user?.profilePictureUrl}
            alt="Your Avatar"
            className="avatar-large"
          />
          <p>Avatars are generated automatically from your username.</p>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={160}
            placeholder="Tell us about yourself... (160 characters max)"
          />
          <small className="char-counter">{160 - formData.bio.length} characters remaining</small>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="button primary" disabled={isLoading}>
          Save Changes
        </button>
      </form>
    );
  };

  return (
    <div className="page-container-v2"> 
      <Navbar />
      
      <main className="app-layout">
        
        <LeftSidebar onPostClick={() => setIsModalOpen(true)} />
        
        <div className="feed-column">
          {/* Use a glass card for the edit form */}
          <div className="card edit-profile-card">
            <h2>Edit Profile</h2>
            {renderForm()}
          </div>
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

export default EditProfilePage;
