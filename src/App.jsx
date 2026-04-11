import React from 'react';
import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import FilterBar from './components/filters/FilterBar';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Hero />
      <FilterBar />
      <main>
        {/* Gallery/Flow Grid will go here */}
      </main>
      <footer>
        {/* Footer will go here */}
      </footer>
    </div>
  );
}

export default App;
