import React from 'react';
import './family-overview.css';

const FamilyOverview = ({ font }) => {
  if (!font?.displayVsText) return null;

  return (
    <section className="font-family-overview-section">
      <div className="overview-container">
        <h2 className="overview-title">Family Overview</h2>
        
        <div className="overview-grid">
          <div className="overview-card">
            <h3 className="overview-subtitle">Display Family</h3>
            <div className="overview-style-count">{font.displayVsText.display.styles} Styles</div>
            <p className="overview-desc">{font.displayVsText.display.description}</p>
          </div>
          
          <div className="overview-card">
            <h3 className="overview-subtitle">Text Family</h3>
            <div className="overview-style-count">{font.displayVsText.text.styles} Styles</div>
            <p className="overview-desc">{font.displayVsText.text.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FamilyOverview;
