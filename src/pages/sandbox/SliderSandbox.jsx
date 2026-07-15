import React, { useState } from 'react';
import './SliderSandbox.css';

export default function SliderSandbox() {
  const [tracking, setTracking] = useState(32); // range from -100 to 200 (default 32)
  const [fontSize, setFontSize] = useState(64); // secondary slider to show responsiveness

  // Calculate percentage along the track for thumb alignment or tick positioning
  // min = -100, max = 200, range = 300
  const percentZero = (100 / 300) * 100; // ~33.33%
  const percentCurrent = ((tracking + 100) / 300) * 100;

  return (
    <div className="slider-sandbox-wrapper">
      <div className="slider-sandbox-card">
        <h2 className="sandbox-header">Custom Slider Sandbox</h2>
        <p className="sandbox-desc">
          Replicating the premium <code>Tracking</code> range slider styling using custom accent colors, 
          active outlines, and zero-tick alignment.
        </p>

        {/* The Custom Tracking Slider Component */}
        <div className="custom-slider-container">
          <label className="custom-slider-label" htmlFor="tracking-input">
            Tracking
          </label>
          
          <div className="custom-slider-track-wrap">
            {/* Range Input */}
            <input
              id="tracking-input"
              type="range"
              className="custom-range-input"
              min="-100"
              max="200"
              value={tracking}
              onChange={(e) => setTracking(Number(e.target.value))}
              style={{
                '--slider-progress': `${percentCurrent}%`
              }}
            />

            {/* Zero Tick Mark Indicator */}
            <div 
              className="zero-tick-mark" 
              style={{ left: `${percentZero}%` }}
              title="Zero Value Mark"
            />
          </div>

          <span className="custom-slider-value">{tracking}</span>
        </div>

        {/* Text Preview Display */}
        <div className="sandbox-preview-area">
          <div 
            className="sandbox-preview-text"
            style={{
              letterSpacing: `${tracking / 100}em`,
              fontSize: `${fontSize}px`
            }}
          >
            Ref.design
          </div>
        </div>

        {/* Extra Info */}
        <div className="sandbox-meta-row">
          <span>Min: -100</span>
          <span>Zero Tick: 0</span>
          <span>Max: 200</span>
        </div>
      </div>
    </div>
  );
}
