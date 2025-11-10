const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Get the Models
const User = mongoose.model('User');
const Post = mongoose.model('Post');

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    // If no search query is provided, return empty results
    if (!q) {
      return res.json({ users: [], posts: [] });
    }

    // Create a case-insensitive regular expression from the query
    const searchRegex = new RegExp(q, 'i');

    // Search for Users
    const users = await User.find({ username: searchRegex })
      .select('username profilePictureUrl') 
      .limit(10); 

    //  Search for Posts
    const posts = await Post.find({ text: searchRegex })
      .populate('user', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl')
      .sort({ createdAt: -1 })
      .limit(20); // Limit to 20 results

    // Return both sets of results
    res.json({ users, posts });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
