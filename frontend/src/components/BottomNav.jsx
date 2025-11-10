import React from 'react';
import { NavLink } from 'react-router-dom';
// Import the new Compass icon for our "Explore" feed
import { Home, Bell, User, Search, Compass } from 'react-feather';
import { useAuth } from '../context/AuthContext.jsx';

function BottomNav() {
  const { user, unreadCount } = useAuth();
  // Get the reliable ID, just in case
  const currentUserId = user?.id || user?._id;

  const getNavLinkClass = ({ isActive }) => 
    isActive ? 'bottom-nav-link active' : 'bottom-nav-link';

  return (
    <nav className="bottom-nav">
      <ul className="bottom-nav-menu">
        
        <li>
          <NavLink to="/following" className={getNavLinkClass}>
            <Home size={24} />
          </NavLink>
        </li>

        <li>
          <NavLink to="/" end className={getNavLinkClass}>
            <Compass size={24} />
          </NavLink>
        </li>

        <li>
          <NavLink to="/search" className={getNavLinkClass}>
            <Search size={24} />
          </NavLink>
        </li>

        <li>
          <NavLink to="/notifications" className={getNavLinkClass}>
            <div className="notification-icon-wrapper">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
          </NavLink>
        </li>

        {user && (
          <li>
            <NavLink to={`/profile/${currentUserId}`} className={getNavLinkClass}>
              <User size={24} />
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default BottomNav;