🐝 Buzzly - Full Stack Social Media App

A fully responsive social media application built with the MERN stack (MongoDB, Express, React, Node.js). It features real-time interactions, secure authentication, and a modern UI with dark mode support.

🚀 Live Demo

Frontend (Vercel): https://social-app-two-sigma.vercel.app

Backend (Render): https://social-app-keez.onrender.com

Note: The backend is hosted on a free Render instance. It may take 30-50 seconds to wake up on the first visit. Please be patient!

✨ Key Features

🔒 Authentication & Security

Secure Login/Signup: Built with JWT (JSON Web Tokens) and bcrypt for password hashing.

Authorization: Protected routes ensure only logged-in users can perform actions.

📱 Core Social Features

Create Posts: Share thoughts and upload images (image URL support).

Feed & Explore: View posts from everyone or just people you follow.

Interactions: Like and Comment on posts in real-time.

Save Posts: Bookmark your favorite posts for later.

Notifications: Get notified when someone likes or comments on your post.

🎨 UI/UX Design

Responsive Design: Works perfectly on Mobile, Tablet, and Desktop.

Dark Mode: Toggle between light and dark themes.

Modern Interface: Glassmorphism effects and smooth transitions.

🛠️ Tech Stack

Component

Technology

Frontend

React.js, Context API, CSS3

Backend

Node.js, Express.js

Database

MongoDB Atlas

Deployment

Vercel (Frontend), Render (Backend)

⚙️ Setup & Installation

If you want to run this locally:

Clone the repo:

git clone [https://github.com/kcdoescode/social-app.git](https://github.com/kcdoescode/social-app.git)


Install Dependencies:

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install


Environment Variables:
Create a .env file in backend with MONGO_URI and JWT_SECRET.
Create a .env file in frontend with REACT_APP_API_BASE_URL.

Run the App:

# Terminal 1 (Backend)
cd backend
npm start

# Terminal 2 (Frontend)
cd frontend
npm start
