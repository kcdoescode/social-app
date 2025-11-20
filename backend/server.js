const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- 1. UPDATED CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:3000',                      // Local React
  'https://social-app-two-sigma.vercel.app',    // Your Live Vercel App
  process.env.CLIENT_URL                        // Fallback from .env
];

app.use(cors({
  origin: function(origin, callback){
      // allow requests with no origin (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      
      if(allowedOrigins.indexOf(origin) === -1 && origin !== process.env.CLIENT_URL){
          // If the origin isn't in our list, we log it but ALLOW it for now to fix "Loading..." issues.
          console.log("⚠️ CORS Warning: Request from unknown origin:", origin);
          return callback(null, true); // <-- TEMPORARY FIX: Allow all to ensure connection works
      }
      return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// --- 2. SCHEMAS (Kept exactly the same as your code) ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  profilePictureUrl: { type: String },
  bio: { type: String, default: '', maxLength: 160 },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    profilePictureUrl: { type: String },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, 
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true }, 
  read: { type: Boolean, default: false }
}, { timestamps: true });

// Mongoose Models
const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

// --- 3. ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search', require('./routes/search'));

// --- 4. LOUD DEBUG DATABASE CONNECTION (The Fix) ---
console.log("---------------------------------------------");
console.log("🚀 STARTING SERVER...");
console.log("---------------------------------------------");

// Check if MONGO_URI exists
if (!process.env.MONGO_URI) {
  console.error("❌ FATAL ERROR: MONGO_URI is missing in Environment Variables!");
  console.error("   Please go to Render Dashboard > Environment and add MONGO_URI");
  process.exit(1); // Stop the app so Render knows it failed
} else {
  // Only print the first 15 chars for security
  console.log(`✅ MONGO_URI found: ${process.env.MONGO_URI.substring(0, 15)}...`);
}

console.log("⏳ Attempting to connect to MongoDB...");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    app.listen(PORT, () => {
      console.log(`✅ Backend server running on port ${PORT}`);
      console.log("---------------------------------------------");
    });
  })
  .catch(err => {
    console.error("-----------------------------------------");
    console.error("❌ MONGO CONNECTION ERROR:");
    console.error(err.message); // Print the message
    console.error("   Full Error:", err);
    console.error("-----------------------------------------");
    // We do NOT exit here so we can see the logs in Render
  });