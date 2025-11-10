const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Get the Models
const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Notification = mongoose.model('Notification');

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

// Notification Routes


router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userTo: req.user.id })
      .populate('userFrom', 'username profilePictureUrl')
      .populate('post', 'text imageUrl') 
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.get('/count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userTo: req.user.id, 
      read: false 
    });
    
    res.json({ count });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// NEW ROUTE: Mark All as Read

router.put('/read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userTo: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ message: 'Notifications marked as read' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;

