import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Import reusable components
import Navbar from '../components/Navbar.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import Modal from '../components/Modal.jsx';
import CreatePostForm from '../components/CreatePostForm.jsx';

// Import the new, separate CSS file for this page
import '../styles/AboutUs.css';

function AboutUsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="page-container-v2"> 
      <Navbar />
      
      <main className="app-layout">
        
        <LeftSidebar onPostClick={() => setIsModalOpen(true)} />
        
        <div className="feed-column">
          <div className="card about-us-card">
            
            <h2>About Buzzly💅</h2>
            
            <p className="about-us-intro">
              Welcome to Buzzly! This is a modern, lightweight social media platform
              built from the ground up to connect people and share ideas in a
              clean, aesthetic, and minimal environment.
            </p>

            <h3>Tech Stack</h3>
            <p>This full-stack application is built with the MERN stack:</p>
            <ul className="stack-list">
              <li><strong>M</strong>ongoDB (for the database)</li>
              <li><strong>E</strong>xpress.js (for the backend API)</li>
              <li><strong>R</strong>eact (for the frontend UI)</li>
              <li><strong>N</strong>ode.js (for the backend server)</li>
            </ul>
            
            <h3>Contact & Suggestions</h3>
            <p>
              This app was built by Khushi. If you have any suggestions, feature
              requests, or just want to connect, feel free to send an email to:
            </p>
            <a href="mailto:chauhankm81@gmail.com" className="contact-link">
              chauhankm81@gmail.com
            </a>

            <h3>Acknowledgements</h3>
            <p>This project is made possible by some wonderful free resources:</p>
            <ul className="credits-list">
              <li>Avatars by <a href="https://dicebear.com/" target="_blank" rel="noopener noreferrer">DiceBear</a></li>
              <li>Icons by <a href="https://feathericons.com/" target="_blank" rel="noopener noreferrer">React Feather</a></li>
              <li>Fonts by <a href="https://fonts.google.com/" target="_blank" rel="noopener noreferrer">Google Fonts</a></li>
            </ul>

          </div>
        </div>
        
        <RightSidebar />

      </main>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Post"
      >
        <CreatePostForm onPostCreated={() => setIsModalOpen(false)} />
      </Modal>

      <button
        className="floating-post-button"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>
      
    </div>
  );
}

export default AboutUsPage;
