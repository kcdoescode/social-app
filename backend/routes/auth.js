const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Get the User model that was already registered in server.js
const User = mongoose.model('User');

// [POST] /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Auto-generate the DiceBear URL
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(username)}`;

    user = new User({
      username,
      email,
      password,
      profilePictureUrl: avatarUrl
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Add the new profilePictureUrl to the token payload
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    //  Include following & followers in the response
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        savedPosts: user.savedPosts,
        following: user.following,    
        followers: user.followers     
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// [POST] /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Add profilePictureUrl to the token on login
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    // Include following & followers in the response
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        savedPosts: user.savedPosts,
        following: user.following,    
        followers: user.followers     
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
