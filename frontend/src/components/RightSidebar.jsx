import React, { useState } from 'react';
// Import new icons
import { Loader, Info, Calendar, ArrowLeft } from 'react-feather';

//FUN FACT FALLBACKS
const FUN_FACTS = [
  { headline: "The First Computer 'Bug'", paragraph: "The first actual computer 'bug' was a real moth! In 1947, engineers at Harvard found a moth stuck in a relay, causing their Mark II computer to malfunction." },
  { headline: "The First Webcam", paragraph: "The world's first webcam was invented at Cambridge University to watch a coffee pot. Researchers aimed it at a coffee machine so they could see if it was full without getting up." },
  { headline: "Why is 'Spam' Mail Called Spam?", paragraph: "The term 'spam' for unwanted email comes from a famous 1970 Monty Python sketch where Vikings loudly sing 'Spam, Spam, Spam!' drowning out all other conversation." },
  { headline: "The First 1GB Hard Drive", paragraph: "In 1980, IBM released the first 1-gigabyte hard drive. It weighed over 550 pounds (250kg) and cost $40,000." },
  { headline: "QWERTY Keyboard Origins", paragraph: "The QWERTY keyboard layout wasn't designed to be fast. It was designed to be *slow* to prevent early typewriter keys from jamming." },
  { headline: "The First 'Social' Network", paragraph: "The first recognizable social media site was SixDegrees.com, launched in 1997. It allowed users to create a profile and make friends with other users." },
  { headline: "Wi-Fi Wasn't Made for Wi-Fi", paragraph: "The core technology for Wi-Fi was an unintended byproduct of a failed experiment by an Australian radio-astronomer. He was trying to detect exploding black holes." },
  { headline: "The First Computer Mouse", paragraph: "The first computer mouse was invented by Douglas Engelbart in 1964. It was made of wood, had one button, and two wheels." },
  { headline: "Domain Name Registration", paragraph: "In 1985, domain names weren't in high demand. In fact, registration was free until 1995. The first domain ever registered was Symbolics.com." },
  { headline: "The First 'Mobile' Phone", paragraph: "The first 'portable' cell phone was the Motorola DynaTAC 8000X in 1983. It weighed 2.5 pounds (1.1kg), cost $3,995, and offered 30 minutes of talk time." },
  { headline: "PayPal's Original Idea", paragraph: "PayPal was originally founded (as 'Confinity') to beam money between Palm Pilots. It was voted one of the 'Top 10 Worst Business Ideas of 1999'. It's now worth billions." },
  { headline: "The 'Immortal' Jellyfish", paragraph: "The *Turritopsis dohrnii* is a species of jellyfish that is biologically immortal. When it gets old or injured, it can revert back to its polyp stage, effectively starting its life cycle all over again." },
  { headline: "Nintendo's Origins", paragraph: "Nintendo was founded in 1889, over 130 years ago. It didn't make video games. It was a small company in Kyoto, Japan, that produced and sold hand-painted playing cards called 'Hanafuda'." },
  { headline: "The First Vending Machine", paragraph: "The very first vending machine was invented in the 1st century AD by Hero of Alexandria. It was a 'holy water' dispenser. When you inserted a coin, its weight would hit a lever and dispense a small amount of water." },
  { headline: "Space Smells Like...", paragraph: "According to astronauts, space has a very distinct smell. They describe it as a 'metallic' and 'smoky' scent, similar to seared steak, hot metal, and welding fumes." },
  { headline: "A Jiffy is a Real Unit of Time", paragraph: "A 'jiffy' isn't just a saying. In physics and computing, it's a real unit of time. It's defined as the time it takes for light to travel one centimeter in a vacuum (about 33.3 picoseconds)." },
  { headline: "The First 'Google' Storage", paragraph: "The original server rack for Google when it was a research project at Stanford was built out of LEGO bricks. The colorful, interlocking bricks were used because they were cheap and easy to expand." },
  { headline: "The @ Symbol's Long History", paragraph: "The '@' symbol isn't new. It's been around for centuries. It was used by medieval monks as a shorthand for the Latin word 'ad' (meaning 'to' or 'at') to save time and parchment when copying manuscripts." },
  { headline: "Where 'Bluetooth' Got Its Name", paragraph: "Bluetooth technology is named after a 10th-century Viking king, Harald Bluetooth. He was famous for uniting warring tribes in Denmark and Norway, just as the technology unites different devices." },
  { headline: "The Loudest Sound Ever Recorded", paragraph: "The loudest sound in modern history was the 1883 eruption of Krakatoa. The explosion was heard over 3,000 miles (4,800km) away and the shockwave ruptured the eardrums of sailors 40 miles away." }
];


function RightSidebar() {
  const [view, setView] = useState('main'); // 'main', 'history', 'fact'
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [funFact, setFunFact] = useState(null);

  
  const handleBack = () => {
    setView('main');
    setError(null);
  };
  
  /*Pick and show a random fun fact*/
  const handleShowFunFact = () => {
    const randomIndex = Math.floor(Math.random() * FUN_FACTS.length);
    setFunFact(FUN_FACTS[randomIndex]);
    setView('fact');
  };

  /*Fetch the "On This Day" data*/
  const handleFetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    setHistoryItem(null);
    setView('history'); // Switch to the history view

    
    const today = new Date();
    const month = today.getMonth() + 1; // +1 because JS months are 0-11
    const day = today.getDate();

    const historyApiUrl = `https://history.muffinlabs.com/date/${month}/${day}?_=${new Date().getTime()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6-second timeout

      const response = await fetch(historyApiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to load history fact. Please try again.');
      }
      
      const data = await response.json();
      
      // Make sure we have events for this date
      if (!data.data.Events || data.data.Events.length === 0) {
        throw new Error('No historical events found for today. Please try again later.');
      }

      const events = data.data.Events;
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      setHistoryItem({
        date: data.date, 
        text: randomEvent.text,
        year: randomEvent.year
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="sidebar-loading">
          <Loader size={24} className="spinner" />
          <span>Loading...</span>
        </div>
      );
    }
    
    switch(view) {
      
      case 'history':
        return (
          <div className="sidebar-content-wrapper">
            <button className="sidebar-back-button" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
            {error && <div className="error-message">{error}</div>}
            {historyItem && (
              <div className="history-item-container">
                <div className="history-item-header">
                  <Calendar size={18} />
                  <span>On This Day ({historyItem.date})</span>
                </div>
                <h4 className="history-item-headline">In the year {historyItem.year}...</h4>
                <p className="history-item-body">{historyItem.text}</p>
              </div>
            )}
          </div>
        );
        
      case 'fact':
        return (
          <div className="sidebar-content-wrapper">
            <button className="sidebar-back-button" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
            {funFact && (
              <div className="fun-fact-container">
                <div className="fun-fact-header">
                  <Info size={18} />
                  <span>Tech Fun Fact!</span>
                </div>
                <h4 className="fun-fact-headline">{funFact.headline}</h4>
                <p className="fun-fact-body">{funFact.paragraph}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="sidebar-menu-buttons">
            <button className="button secondary" onClick={handleFetchHistory}>
              <Calendar size={18} />
              <span>On This Day in History</span>
            </button>
            <button className="button secondary" onClick={handleShowFunFact}>
              <Info size={18} />
              <span>Get a Tech Fun Fact</span>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="right-sidebar">
      <div className="sidebar-widget">
        <h3>What's Happening</h3>
        {renderContent()}
      </div>
    </div>
  );
}

export default RightSidebar;