import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as notificationService from '../services/notificationService.js';
import { Heart, MessageSquare, UserPlus } from 'react-feather';
import Navbar from '../components/Navbar.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import Modal from '../components/Modal.jsx';
import CreatePostForm from '../components/CreatePostForm.jsx';

import '../styles/Notifications.css';

function NotificationItem({ notification }) {
  const { userFrom, type, post } = notification;

  let icon;
  let textContent;

  switch (type) {
    case 'like':
      icon = <Heart size={20} className="notification-icon like" />;
      textContent = (
        <span className="notification-text">
          liked your post: "<em>{post?.text ? `${post.text.substring(0, 50)}...` : 'an image'}</em>"
        </span>
      );
      break;
      
    case 'comment':
      icon = <MessageSquare size={20} className="notification-icon comment" />;
      textContent = (
        <span className="notification-text">
          commented on your post: "<em>{post?.text ? `${post.text.substring(0, 50)}...` : 'an image'}</em>"
        </span>
      );
      break;

    case 'follow':
      icon = <UserPlus size={20} className="notification-icon follow" />;
      textContent = (
        <span className="notification-text">
          started following you.
        </span>
      );
      break;
      
    default:
      icon = null;
      textContent = <span className="notification-text">Unknown notification.</span>;
  }

  return (
    <li className="notification-item">
      {icon}
      <div className="notification-content">
        <Link to={`/profile/${userFrom._id}`} className="post-author-link">
          <img 
            src={userFrom.profilePictureUrl} 
            alt={userFrom.username}
            className="avatar-small"
          />
          <strong>{userFrom.username}</strong>
        </Link>
        {textContent}
      </div>
    </li>
  );
}


//Main Page Component
function NotificationsPage() {
  // get the token AND the function to refresh the count
  const { token, fetchUnreadCount } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // For the "Post" button

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const data = await notificationService.getNotifications(token);
        setNotifications(data);
        
        await notificationService.markNotificationsRead(token);
        
        fetchUnreadCount();
        
      } catch (err) {
        setError(err.message || 'Failed to load notifications.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [token]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-spinner">Loading...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    if (notifications.length === 0) {
      return <div className="no-notifications">You have no new notifications.</div>;
    }
    return (
      <ul className="notification-list">
        {notifications.map(notif => (
          <NotificationItem key={notif._id} notification={notif} />
        ))}
      </ul>
    );
  };

  return (
    <div className="page-container-v2"> 
      <Navbar />
      
      <main className="app-layout">
        
        <LeftSidebar onPostClick={() => setIsModalOpen(true)} />
        
        <div className="feed-column">
          <div className="card notification-page-card">
            <h2>Notifications</h2>
            {renderContent()}
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

export default NotificationsPage;

