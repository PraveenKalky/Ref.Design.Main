import React, { useState, useEffect } from 'react';
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

  return (
    <div className="app-container">
      <Navbar savedCount={savedCount} />
      <Hero />
      <FilterBar />
      <CardGrid savedItems={savedItems} toggleSave={toggleSave} />
      <Footer />
      <Agentation />
    </div>
  );
}

export default App;
