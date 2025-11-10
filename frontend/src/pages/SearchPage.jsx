import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as searchService from '../services/searchService.js';
import { Search, Loader, Info, Calendar, ArrowLeft } from 'react-feather'; // Added ArrowLeft for consistency, though not used here yet

import Navbar from '../components/Navbar.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import PostCard from '../components/PostCard.jsx';
import Modal from '../components/Modal.jsx';
import CreatePostForm from '../components/CreatePostForm.jsx';

import '../styles/Search.css';

const FUN_FACTS = [
  { headline: "The First Computer 'Bug'", paragraph: "The first actual computer 'bug' was a real moth! In 1947, engineers at Harvard found a moth stuck in a relay, causing their Mark II computer to malfunction." },
  { headline: "The First Webcam", paragraph: "The world's first webcam was invented at Cambridge University to watch a coffee pot. Researchers aimed it at a coffee machine so they could see if it was full without getting up." },
  { headline: "Why is 'Spam' Mail Called Spam?", paragraph: "The term 'spam' for unwanted email comes from a famous 1970 Monty Python sketch where Vikings loudly sing 'Spam, Spam, Spam!' drowning out all other conversation." },
  { headline: "The First 1GB Hard Drive", paragraph: "In 1980, IBM released the first 1-gigabyte hard drive. It weighed over 550 pounds (250kg) and cost $40,000." },
  { headline: "QWERTY Keyboard Origins", paragraph: "The QWERTY keyboard layout wasn't designed to be fast. It was designed to be *slow* to prevent early typewriter keys from jamming." },
  { headline: "The First 'Social' Network", paragraph: "The first recognizable social media site was SixDegrees.com, launched in 1997. It allowed users to create a profile and make friends with other users." },
];

// Sub-component to render the User results
function UserResultItem({ user }) {
  return (
    <Link to={`/profile/${user._id}`} className="user-result-item">
      <img 
        src={user.profilePictureUrl} 
        alt={user.username}
        className="avatar-small"
      />
      <span className="user-result-name">{user.username}</span>
    </Link>
  );
}

// Sub-component to render the History item
function HistoryItem({ item }) {
  return (
    <div className="history-item-container">
      <div className="history-item-header">
        <Calendar size={18} />
        <span>On This Day ({item.date})</span>
      </div>
      <h4 className="history-item-headline">In the year {item.year}...</h4>
      <p className="history-item-body">{item.text}</p>
    </div>
  );
}

// Sub-component to render the Fun Fact item
function FunFactItem({ item }) {
  return (
    <div className="fun-fact-container">
      <div className="fun-fact-header">
        <Info size={18} />
        <span>Tech Fun Fact!</span>
      </div>
      <h4 className="fun-fact-headline">{item.headline}</h4>
      <p className="fun-fact-body">{item.paragraph}</p>
    </div>
  );
}


// Main Page Component
function SearchPage() {
  const { token } = useAuth();
  
  // State for Search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NEW STATE for Discovery Content
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(true);
  const [discoveryContent, setDiscoveryContent] = useState(null); // {type, item}

  
  const showRandomFunFact = () => {
    const randomIndex = Math.floor(Math.random() * FUN_FACTS.length);
    setDiscoveryContent({ type: 'fact', item: FUN_FACTS[randomIndex] });
  };

  useEffect(() => {
    const fetchHistoryFact = async () => {
      
      const today = new Date();
      const month = today.getMonth() + 1; // +1 because JS months are 0-11
      const day = today.getDate();
  
      const historyApiUrl = `https://history.muffinlabs.com/date/${month}/${day}?_=${new Date().getTime()}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(historyApiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('History API failed');
        
        const data = await response.json();

        // Add check for empty events
        if (!data.data.Events || data.data.Events.length === 0) {
          throw new Error('No historical events found for today.');
        }

        const events = data.data.Events;
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        setDiscoveryContent({
          type: 'history',
          item: { date: data.date, text: randomEvent.text, year: randomEvent.year }
        });
      } catch (err) {
        console.error(err);
        showRandomFunFact(); // Fallback to fun fact
      } finally {
        setIsDiscoveryLoading(false);
      }
    };
    
    fetchHistoryFact();
  }, []); // Empty array runs this ONCE on page load

  
  // Handle the search submit
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setDiscoveryContent(null);
    setIsLoading(true);
    setError('');
    setResults(null);
    try {
      const searchData = await searchService.search(query, token);
      setResults(searchData);
    } catch (err) {
      setError(err.message || 'Failed to perform search.');
    } finally {
      setIsLoading(false);
    }
  };

  // Renders the results OR discovery content
  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-spinner">Searching...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    
    if (!results) {
      // If no search has been performed, show discovery content
      if (isDiscoveryLoading) {
        return <div className="loading-spinner">Loading what's new...</div>;
      }
      if (discoveryContent?.type === 'history') {
        return (
          <div className="card search-discovery-card">
            <h3>What's Happening</h3>
            <HistoryItem item={discoveryContent.item} />
          </div>
        );
      }
      if (discoveryContent?.type === 'fact') {
        return (
          <div className="card search-discovery-card">
            <h3>What's Happening</h3>
            <FunFactItem item={discoveryContent.item} />
          </div>
        );
      }
      return <div className="search-prompt">Search for users or posts.</div>;
    }
    
    const { users, posts } = results;

    if (users.length === 0 && posts.length === 0) {
      return <div className="search-prompt">No results found for "{query}".</div>;
    }

    return (
      <div className="search-results">
        {users.length > 0 && (
          <section className="results-section card">
            <h3>Users</h3>
            <div className="user-results-list">
              {users.map(user => (
                <UserResultItem key={user._id} user={user} />
              ))}
            </div>
          </section>
        )}

        {posts.length > 0 && (
          <section className="results-section">
            <h3>Posts</h3>
            <div className="post-list">
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onPostUpdated={() => {}}
                  onPostDeleted={() => {}}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="page-container-v2"> 
      <Navbar />
      
      <main className="app-layout">
        
        <LeftSidebar onPostClick={() => setIsModalOpen(true)} />
        
        <div className="feed-column">
          <div className="card search-page-card">
            <h2>Search</h2>
            
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for users or posts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="button primary">
                <Search size={20} />
              </button>
            </form>
          </div>

          {renderContent()}
        </div>
        

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

export default SearchPage;