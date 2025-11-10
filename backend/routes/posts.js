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
// This handy function checks for a valid token on protected routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Add the user payload to the request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Post Routes

// [GET] /api/posts - Get all posts for the "Explore" feed
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//NEW "FOLLOWING" FEED ROUTE
// [GET] /api/posts/following - Get posts from users the current user follows
router.get('/following', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let feedUserIds = currentUser.following;
    feedUserIds.push(req.user.id); 

    const posts = await Post.find({ user: { $in: feedUserIds } })
      .populate('user', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// [POST] /api/posts - Create a new post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text, imageUrl } = req.body;

    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'Post must include text or an image URL' });
    }

    const newPost = new Post({
      user: req.user.id,
      text,
      imageUrl,
    });

    const post = await newPost.save();
    
    // Repopulate the user info before sending it back
    const populatedPost = await Post.findById(post.id)
      .populate('user', 'username profilePictureUrl');

    res.status(201).json(populatedPost);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// [GET] /api/posts/saved - Gets all posts saved by the logged-in user.
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    // Find the logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all posts whose IDs are in the user's savedPosts array
    const posts = await Post.find({ _id: { $in: user.savedPosts } })
      .populate('user', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl')
      .sort({ createdAt: -1 }); // Show newest first

    res.json(posts);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// [PUT] /api/posts/:id/like - Like/Unlike a post
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(like => like.toString() === req.user.id);
    
    if (likeIndex > -1) {
      // User is UNLIKING
      post.likes.splice(likeIndex, 1);
    } else {
      // User is LIKING
      post.likes.push(req.user.id);

      // Create notification, but don't notify for your own post
      if (post.user.toString() !== req.user.id) {
        await Notification.create({
          userTo: post.user,
          userFrom: req.user.id,
          post: post._id,
          type: 'like'
        });
      }
    }

    await post.save();
    
    // Send back the fully populated post, just like the other routes
    const populatedPost = await Post.findById(post.id)
      .populate('user', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl');

    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// [POST] /api/posts/:postId/save - Toggles saving/unsaving a post.
router.post('/:postId/save', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const user = await User.findById(req.user.id);
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already saved this post
    const saveIndex = user.savedPosts.findIndex(savedId => savedId.toString() === postId);

    if (saveIndex > -1) {
      // User has saved it, so UNSAVE
      user.savedPosts.splice(saveIndex, 1);
    } else {
      // User has not saved it, so SAVE
      user.savedPosts.push(postId);
    }

    await user.save();
    
    // Return the updated list of saved posts
    res.json({ savedPosts: user.savedPosts });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// [POST] /api/posts/:id/comment - Comment on a post
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Find the user to get their current username and pic
    const user = await User.findById(req.user.id).select('username profilePictureUrl');

    const newComment = {
      user: req.user.id,
      username: user.username, // Use the current username
      profilePictureUrl: user.profilePictureUrl, // Use the current pic
      text,
    };

    post.comments.push(newComment);
    await post.save();

    // Create notification, but not for your own post
    if (post.user.toString() !== req.user.id) {
      await Notification.create({
        userTo: post.user,
        userFrom: req.user.id,
        post: post._id,
        type: 'comment'
      });
    }

    // Send back the fully populated post
    const populatedPost = await Post.findById(post.id)
      .populate('user', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl');
    
    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// [GET] /api/posts/user/:userId - Get all posts by a specific user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});


// [DELETE] /api/posts/:postId - Deletes a post
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    // Also delete any notifications related to this post
    await Notification.deleteMany({ post: req.params.postId });

    res.json({ message: 'Post deleted successfully' });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});


// [DELETE] /api/posts/:postId/comment/:commentId - Deletes a single comment
router.delete('/:postId/comment/:commentId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === req.params.commentId
    );
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the one who made the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    post.comments.pull({ _id: req.params.commentId });
    await post.save();
    
    // Delete any comment notifications
    await Notification.deleteMany({
      post: req.params.postId,
      userFrom: req.user.id,
      type: 'comment'
    });
    
    const populatedPost = await Post.findById(post.id)
      .populate('user', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl');

    res.json(populatedPost);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;