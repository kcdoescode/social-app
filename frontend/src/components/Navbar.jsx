import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
//Import Sun and Moon icons for the theme toggle
import { Sun, Moon } from 'lucide-react';

function Navbar() {
  // Get theme and toggleTheme from context
  const { user, theme, toggleTheme } = useAuth();

  if (!user) {
    return null; 
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Buzzly
      </Link>
      <div className="navbar-user">
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          aria-label="Toggle light/dark theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <span className="navbar-username">Sup cutie, {user.username}? </span>
      </div>
    </nav>
  );
}

export default Navbar;
