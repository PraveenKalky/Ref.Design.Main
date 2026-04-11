import React from 'react';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

const HeroContent = () => {
  return (
    <div className="hero-content">
      <div className="hero-badge">
        <Sparkles size={14} />
        <span>The largest design reference library for developers</span>
      </div>
      <h1>
        Study the best <span>UI Flows</span> & Atomic Components
      </h1>
      <p className="hero-description">
        Stop re-inventing the wheel. Browse 10,000+ curated design screenshots,
        study their UX logic, and build premium interfaces in half the time.
      </p>
      <div className="hero-actions">
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Explore Flows <ArrowRight size={18} />
        </button>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={18} /> Watch Demo
        </button>
      </div>
    </div>
  );
};

export default HeroContent;
