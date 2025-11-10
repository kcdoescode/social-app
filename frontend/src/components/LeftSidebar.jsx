import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling
import { Home, Edit, Bell, User, Search, Info, Bookmark, Compass } from 'react-feather';
import { useAuth } from '../context/AuthContext.jsx';

function LeftSidebar({ onPostClick }) {
  const { user, unreadCount } = useAuth();
  const currentUserId = user?.id || user?._id;

  return (
    <div className="left-sidebar">
      <div className="sidebar-widget">
        <div className="sidebar-widget-content">
        
          <ul className="sidebar-menu">
            
            <li>
              <NavLink to="/following" className="sidebar-menu-item">
                <Home size={24} />
                <span>Following</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/" end className="sidebar-menu-item">
                <Compass size={24} />
                <span>Explore</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/search" className="sidebar-menu-item">
                <Search size={24} />
                <span>Search</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/notifications" className="sidebar-menu-item">
                <div className="notification-icon-wrapper">
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </div>
                <span>Notifications</span>
              </NavLink>
            </li>
            
            {user && (
              <li>
                <NavLink to={`/profile/${currentUserId}`} className="sidebar-menu-item">
                  <User size={24} />
                  <span>My Profile</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink to="/saved" className="sidebar-menu-item">
                <Bookmark size={24} />
                <span>Saved</span>
              </NavLink>
            </li>
            
            <li>
              <NavLink to="/about" className="sidebar-menu-item">
                <Info size={24} />
                <span>About</span>
              </NavLink>
            </li>
            
          </ul>

          <div className="sidebar-post-button">
            <button 
              className="button primary"
              onClick={onPostClick}
            >
              <Edit size={20} />
              <span>Post</span>
            </button>
          </div>

        </div> 
      </div>
    </div>
  );
}

export default LeftSidebar;