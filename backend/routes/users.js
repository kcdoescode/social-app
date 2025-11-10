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

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Adds user payload to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

//User Routes

// [GET] /api/users/profile/:userId
// Get a user's public profile, including follow and post counts
router.get('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username createdAt profilePictureUrl bio followers following');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also get the user's post count
    const postsCount = await Post.countDocuments({ user: req.params.userId });

    // Send a combined profile object
    res.json({
      _id: user._id,
      username: user.username,
      createdAt: user.createdAt,
      profilePictureUrl: user.profilePictureUrl,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount: postsCount
    });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});


// [GET] /api/users/profile
// Get the logged-in user's private profile for the "Edit Profile" page
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email bio profilePictureUrl');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// [PUT] /api/users/profile
// Update the logged-in user's profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { username, bio } = req.body;

  const profileFields = {};
  if (username) profileFields.username = username;
  // Allow setting bio to an empty string
  if (bio || bio === '') profileFields.bio = bio; 

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new username is already taken (if it changed)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true } // Return the updated document
    ).select('-password'); // Send back updated user, without password

    // Re-sign the JWT token in case the username or following list changed
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
        following: user.following 
      }
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    res.json({ user, token }); // Send back new user data and new token

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// [POST] /api/users/:id/follow
// Follow or Unfollow a user (Toggle)
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // UNFOLLOW
      //  Remove targetUser from currentUser's 'following' list
      await currentUser.updateOne({ $pull: { following: targetUserId } });
      //  Remove currentUser from targetUser's 'followers' list
      await targetUser.updateOne({ $pull: { followers: currentUserId } });

      // Remove the 'follow' notification
      await Notification.deleteOne({
        userTo: targetUserId,
        userFrom: currentUserId,
        type: 'follow'
      });

      res.json({ message: 'User unfollowed.' });

    } else {
      // FOLLOW
      // Add targetUser to currentUser's 'following' list
      await currentUser.updateOne({ $push: { following: targetUserId } });
      // Add currentUser to targetUser's 'followers' list
      await targetUser.updateOne({ $push: { followers: currentUserId } });

      // Create a 'follow' notification
      const existingNotif = await Notification.findOne({
        userTo: targetUserId,
        userFrom: currentUserId,
        type: 'follow'
      });
      
      if (!existingNotif) {
        await Notification.create({
          userTo: targetUserId,
          userFrom: currentUserId,
          type: 'follow'
          // intentionally leave 'post' null
        });
      }

      res.json({ message: 'User followed.' });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;