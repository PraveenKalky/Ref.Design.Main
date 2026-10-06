import React, { useState } from 'react';
import { Star, MoreHorizontal, Bookmark, FileImage, LayoutTemplate, ChevronDown, SlidersHorizontal, Search, Share, Monitor, Tablet, Smartphone, ArrowUpRight } from 'lucide-react';
import './WebsiteOverview.css';

const SECTION_FILTERS = [
  'All', 'Hero', 'Navigation', 'Features', 'Pricing', 'Testimonials', 
  'CTA', 'FAQ', 'Footer', 'Dashboard', 'Forms', 'Authentication', 
  'Integrations', 'Comparison', 'Contact', 'Blog', 'Other'
];

const AnimatedText = ({ text }) => (
  <span>
    {[...text].map((char, i) => (
      <span
        className="char"
        style={{ "--i": i }}
        key={i}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </span>
);

export default function WebsiteOverview({ 
  website, 
  isSaved, 
  toggleSave,
  viewMode,
  setViewMode,
  sectionFilter,
  setSectionFilter,
  filteredSectionsCount
}) {
  const [activePreset, setActivePreset] = useState('Desktop');

  // If website is not provided, return nothing or a skeleton
  if (!website) return null;

  // Extract domain from link safely
  let domain = 'website.com';
  if (website.link && website.link !== '#') {
    try {
      domain = new URL(website.link).hostname.replace('www.', '');
    } catch (e) {
      // If URL parsing fails, fallback to the string or default
      domain = website.link.replace('www.', '') || 'website.com';
    }
  }

  return (
    <div className="website-overview">
      {/* 1. Detail Hero Section */}
      <div className="detail-hero">
        <img src={website.logo} alt={`${website.title} logo`} className="detail-hero-logo" />
        
        <div className="detail-hero-content">
          <div className="detail-hero-header">
            <h1 className="detail-hero-title">{website.title}</h1>
            
            <div className="detail-hero-actions">
              {website.link && website.link !== '#' && (
                <a 
                  href={website.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="action-btn"
                  title="Visit Website"
                  style={{ textDecoration: 'none' }}
                >
                  <ArrowUpRight size={16} /> Visit {domain}
                </a>
              )}
              <button 
                className={`action-btn ${isSaved ? 'primary' : ''}`}
                onClick={() => toggleSave(website.id)}
              >
                <Bookmark size={16} className={isSaved ? 'save-icon-filled' : ''} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button className="action-btn icon-only">
                <Share size={16} />
              </button>
              <button className="action-btn icon-only">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
          
          <p className="detail-hero-description">{website.subtitle}</p>
          
          {website.categories && Array.isArray(website.categories) && website.categories.length > 0 && (
            <div className="detail-hero-meta">
              <div className="detail-hero-categories">
                {website.categories.map((cat, i) => (
                  <React.Fragment key={i}>
                    <span className="detail-hero-category">{cat}</span>
                    {i < website.categories.length - 1 && <span className="detail-hero-dot">•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Ref Control Bar */}
      <div>
        <div className="ref-control-bar">
          <div className="ref-cb-left">
            <button className="action-btn">
              Latest <ChevronDown size={16} />
            </button>
            
            <div className="ref-cb-divider"></div>
            
            <div className="segmented-control">
              <button 
                className={`segment-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
              >
                Preview
              </button>
              <button 
                className={`segment-btn ${viewMode === 'sections' ? 'active' : ''}`}
                onClick={() => setViewMode('sections')}
              >
                Sections
              </button>
            </div>
            
            {viewMode === 'sections' && (
              <>
                <div className="ref-cb-divider"></div>
                <button className="action-btn icon-only">
                  <Search size={16} />
                </button>
              </>
            )}
          </div>
          
          <div className="ref-cb-right">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { name: 'Desktop', icon: <Monitor size={14} /> },
                { name: 'Tablet', icon: <Tablet size={14} /> },
                { name: 'Mobile', icon: <Smartphone size={14} /> }
              ].map(preset => {
                const isSelected = activePreset === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    className="shuffle-hover"
                    onClick={() => setActivePreset(preset.name)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '100px',
                      border: `1px solid ${isSelected ? 'var(--dv-text)' : 'var(--border-color, #e5e7eb)'}`,
                      backgroundColor: isSelected ? 'var(--dv-text)' : 'transparent',
                      color: isSelected ? 'var(--dv-bg)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    {preset.icon}
                    <AnimatedText text={preset.name} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {viewMode === 'sections' && (
          <div className="section-filters-container">
            {SECTION_FILTERS.map(filter => (
              <button
                key={filter}
                className={`section-filter-pill ${sectionFilter === filter ? 'active' : ''}`}
                onClick={() => setSectionFilter(filter)}
              >
                <AnimatedText text={filter} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
