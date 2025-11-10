import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import FeedPage from './pages/FeedPage.jsx'; 
import ProfilePage from './pages/ProfilePage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import BottomNav from './components/BottomNav.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import SavedPostsPage from './pages/SavedPostsPage.jsx';

import FollowingFeedPage from './pages/FollowingFeedPage.jsx';



const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/following" replace />; // Default to following feed
  }
  return children;
};


function App() {
  const { isLoading, theme } = useAuth();

  if (isLoading) {
    return (
      <div className={`theme-wrapper ${theme || 'light'}`}>
        <div className="page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-wrapper ${theme}`}>
      <Routes>
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/following"
          element={
            <ProtectedRoute>
              <FollowingFeedPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <AboutUsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPostsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute> 
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <BottomNav />
    </div>
  );
}

export default App;