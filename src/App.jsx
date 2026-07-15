import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import FilterBar from './components/filter-bar/FilterBar';
import CardGrid from './components/card-grid/CardGrid';
import Footer from './components/footer/Footer';
import { Agentation } from 'agentation';
import { Routes, Route, Outlet } from 'react-router-dom';
import Fonts from './pages/Fonts';
import FontDetails from './pages/font-details/FontDetails';
import SearchResults from './pages/search-results/SearchResults';
import Preloader from './components/preloader/Preloader';
import NotFound from './pages/404/NotFound';
import HoverTests from './pages/HoverTests';
import ArcCarousel from './pages/sandbox/ArcCarousel';
import SliderSandbox from './pages/sandbox/SliderSandbox';

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [savedItems, setSavedItems] = useState(() => {
    const saved = localStorage.getItem('dv-saved-items');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (showLoader) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }
  }, [showLoader]);

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
      {showLoader && <Preloader onComplete={() => setShowLoader(false)} />}
      
      <Routes>
        {/* Isolated Sandbox Routes */}
        <Route path="/sandbox/arc-carousel" element={<ArcCarousel />} />
        <Route path="/sandbox/slider" element={<SliderSandbox />} />

        {/* Core Layout containing global Navbar and Footer */}
        <Route element={
          <>
            <Navbar savedCount={savedCount} theme={theme} toggleTheme={toggleTheme} />
            <Outlet />
            <Footer />
          </>
        }>
          <Route path="/" element={
            <>
              <Hero />
              <FilterBar />
              <CardGrid savedItems={savedItems} toggleSave={toggleSave} />
            </>
          } />
          <Route path="/fonts" element={<Fonts />} />
          <Route path="/fonts/:fontId" element={<FontDetails />} />
          <Route path="/search-results" element={<SearchResults savedItems={savedItems} toggleSave={toggleSave} />} />
          <Route path="/hover-tests" element={<HoverTests />} />
          
          {/* Fallback route for 404 page now INSIDE the layout */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      <Agentation />
    </div>
  );
}

export default App;
