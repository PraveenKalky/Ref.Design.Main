import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import FilterBar from './components/filter-bar/FilterBar';
import CardGrid from './components/card-grid/CardGrid';
import Footer from './components/footer/Footer';
import { Agentation } from 'agentation';

function App() {
  const [savedItems, setSavedItems] = useState(() => {
    const saved = localStorage.getItem('dv-saved-items');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('dv-saved-items', JSON.stringify(savedItems));
  }, [savedItems]);

  const toggleSave = (id) => {
    setSavedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const savedCount = Object.values(savedItems).filter(Boolean).length;
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';

    // View Transitions API: browser snapshots OLD state,
    // we switch theme synchronously, browser animates NEW state revealing over old snapshot.
    // The old snapshot stays visible throughout → zero blank screen.
    if (!document.startViewTransition) {
      // Fallback for unsupported browsers (Safari etc.)
      setTheme(nextTheme);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });
  };

  return (
    <div className="app-container">
      <Navbar savedCount={savedCount} theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <FilterBar />
      <CardGrid savedItems={savedItems} toggleSave={toggleSave} />
      <Footer />
      <Agentation />
    </div>
  );
}

export default App;
