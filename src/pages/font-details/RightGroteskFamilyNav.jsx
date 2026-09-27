import React, { useState, useEffect } from 'react';
import './right-grotesk-family-nav.css';

const navItems = [
  { id: 'collection', label: 'Right Grotesk Collection', weight: 400, width: 100 },
  { id: 'tall', label: 'Tall Family', weight: 400, width: 30 },
  { id: 'tight', label: 'Tight Family', weight: 400, width: 50 },
  { id: 'narrow', label: 'Narrow Family', weight: 400, width: 75 },
  { id: 'compact', label: 'Compact Family', weight: 400, width: 100 },
  { id: 'casual', label: 'Casual Family', weight: 400, width: 120 },
  { id: 'wide', label: 'Wide Family', weight: 400, width: 135 },
  { id: 'spatial', label: 'Spatial Family', weight: 400, width: 151 },
  { id: 'compact-text', label: 'Compact Text Family', weight: 400, width: 100, opsz: 14 },
  { id: 'casual-text', label: 'Casual Text Family', weight: 400, width: 120, opsz: 14 },
  { id: 'wide-text', label: 'Wide Text Family', weight: 400, width: 135, opsz: 14 },
  { id: 'spatial-text', label: 'Spatial Text Family', weight: 400, width: 151, opsz: 14 }
];

const RightGroteskFamilyNav = () => {
  const [activeId, setActiveId] = useState('collection');

  const handleClick = (id) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Find the most visible section
      let currentActiveId = activeId;
      for (const item of navItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section top is near the top of the viewport
          if (rect.top >= 0 && rect.top <= 300) {
            currentActiveId = item.id;
          }
        }
      }
      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeId]);

  return (
    <div className="rg-family-nav-wrapper">
      <div className="rg-family-nav-scroll-container">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`rg-family-nav-item ${activeId === item.id ? 'active' : ''}`}
            onClick={() => handleClick(item.id)}
            aria-label={`Scroll to ${item.label}`}
          >
            <div 
              className="rg-family-nav-preview" 
              style={{
                fontWeight: item.weight
              }}
            >
              {item.id === 'collection' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin: '0 auto'}}>
                  <path d="M4 6H16V18H4V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4H20V16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <text x="10" y="14" fontSize="8" fontWeight="bold" fill="currentColor" textAnchor="middle">Aa</text>
                </svg>
              ) : 'Aa'}
            </div>
            <div className="rg-family-nav-label">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RightGroteskFamilyNav;
