import React from 'react';
import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import FilterBar from './components/filters/FilterBar';
import FlowGrid from './components/gallery/FlowGrid';
import Footer from './components/footer/Footer';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Hero />
      <FilterBar />
      <main>
        <FlowGrid />
      </main>
      <Footer />
    </div>
  );
}

export default App;
