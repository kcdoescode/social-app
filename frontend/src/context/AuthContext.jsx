import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';
import * as notificationService from '../services/notificationService.js';
import * as postService from '../services/postService.js';
import * as userService from '../services/userService.js';

const AuthContext = createContext(null);

// Helper to safely map posts/users arrays to string IDs
const mapToIdArray = (array) => {
  if (!Array.isArray(array)) return [];
  return array.map(item => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null && (item._id || item.id)) {
      return String(item._id || item.id);
    }
    return String(item);
  });
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [savedPosts, setSavedPosts] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [followingList, setFollowingList] = useState([]);

  // Load stored user data
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      setSavedPosts(mapToIdArray(parsedUser.savedPosts));
      setFollowingList(mapToIdArray(parsedUser.following));
    }
    setIsLoading(false);
  }, []);

  // Fetch unread notifications
  const fetchUnreadCount = useCallback(async () => {
    if (token) {
      try {
        const data = await notificationService.getNotificationCount(token);
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Failed to fetch notification count:", err);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Apply theme to document
  useEffect(() => {
    const oldTheme = theme === 'light' ? 'dark' : 'light';
    document.body.style.backgroundColor = theme === 'light' ? '#f0f2f5' : '#121212';
    document.documentElement.classList.add(theme);
    document.documentElement.classList.remove(oldTheme);
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.classList.remove(theme);
    };
  }, [theme]);

  // Auth: login
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setSavedPosts(mapToIdArray(data.user.savedPosts));
      setFollowingList(mapToIdArray(data.user.following));
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: signup
  const signup = async (username, email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authService.signup(username, email, password);
      setToken(data.token);
      setUser(data.user);
      setSavedPosts(mapToIdArray(data.user.savedPosts));
      setFollowingList(mapToIdArray(data.user.following));
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setUnreadCount(0);
    setSavedPosts([]);
    setFollowingList([]);
    setIsLoading(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Toggle save post (instant UI update)
  const toggleSavePost = async (postId) => {
    if (!token) return;
    const postIdStr = String(postId);

    setUser(currentUser => {
      if (!currentUser) return null;
      const currentSavedPosts = mapToIdArray(currentUser.savedPosts);
      const isAlreadySaved = currentSavedPosts.includes(postIdStr);
      const newSavedPosts = isAlreadySaved
        ? currentSavedPosts.filter(id => id !== postIdStr)
        : [...currentSavedPosts, postIdStr];
      setSavedPosts(newSavedPosts);
      const updatedUser = { ...currentUser, savedPosts: newSavedPosts };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });

    try {
      await postService.savePost(postIdStr, token);
    } catch (err) {
      console.error("Failed to sync saved post:", err);
    }
  };

  // Toggle follow/unfollow (instant UI update)
  const toggleFollow = async (targetUserId) => {
    if (!token) return;
    const targetIdStr = String(targetUserId);

    setUser(currentUser => {
      if (!currentUser) return null;
      const currentFollowingList = mapToIdArray(currentUser.following);
      const isAlreadyFollowing = currentFollowingList.includes(targetIdStr);
      const newFollowingList = isAlreadyFollowing
        ? currentFollowingList.filter(id => id !== targetIdStr)
        : [...currentFollowingList, targetIdStr];
      setFollowingList(newFollowingList);
      const updatedUser = { ...currentUser, following: newFollowingList };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });

    try {
      await userService.toggleFollowUser(targetIdStr, token);
    } catch (err) {
      console.error("Failed to sync follow state:", err);
    }
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const value = {
    token,
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
    unreadCount,
    fetchUnreadCount,
    savedPosts,
    toggleSavePost,
    theme,
    toggleTheme,
    followingList,
    toggleFollow
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
