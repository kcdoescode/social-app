const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware

const allowedOrigins = [
  'http://localhost:3000', // local frontend
  process.env.CLIENT_URL   // *live* frontend 
];

app.use(cors({
  origin: function(origin, callback){
      // allow requests with no origin (like Postman or mobile apps)
      if(!origin) return callback(null, true);
      
      if(allowedOrigins.indexOf(origin) === -1){
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
      }
      return callback(null, true);
  },
  credentials: true
}));


app.use(express.json());

// Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  profilePictureUrl: { type: String },
  bio: { type: String, default: '', maxLength: 160 },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  
  // A list of users this user is following
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // A list of users who follow this user
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
  
  // A post is not required for a 'follow' notification, so it's no longer required
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, 
  
  // Added 'follow' as a valid notification type
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true }, 
  
  read: { type: Boolean, default: false }
}, { timestamps: true });


// Mongoose Models
const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search', require('./routes/search'));

// Database Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });