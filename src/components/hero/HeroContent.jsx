import React from 'react';
import { ArrowRight } from 'lucide-react';

const HeroContent = () => {
  return (
    <div className="hero-content">
      <div className="hero-pill">
        <span>Flows. Screens. Inspiration. All in one place.</span>
      </div>
      
      <h1>A curated museum of digital product design.</h1>
      
      <p className="hero-description ghost-outline">
        Design Vault is Praveen G's personal inspiration platform for designers and developers. 
        Browse UI flows, websites, dashboards, apps, Figma references and font resources 
        without pricing walls or gated access.
      </p>

      <div className="hero-actions">
        <a href="#vault" className="hero-primary-btn">
          Browse curated references
          <ArrowRight size={20} className="arrow-icon" />
        </a>
        <a href="#creator" className="hero-secondary-btn">
          Built by a designer, for designers
        </a>
      </div>
      
      <div className="hero-stats">
        <span>240+ Flows</span>
        <span className="separator">·</span>
        <span>180+ Websites</span>
        <span className="separator">·</span>
        <span>90+ Apps</span>
        <span className="separator">·</span>
        <span>60+ Font Links</span>
        <span className="separator">·</span>
        <span>60+ Components</span>
      </div>
    </div>
  );
};

export default HeroContent;
