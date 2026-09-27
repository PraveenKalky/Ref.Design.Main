import React, { useState } from 'react';
import WebsitesHeroV2 from '../features/websites/hero/v2/WebsitesHeroV2';
import FilterBar from '../components/filter-bar/FilterBar';

export default function Websites() {
  const [viewType, setViewType] = useState('websites'); // websites or sections

  const websitesTabs = [
    { id: 'categories', label: 'Categories' },
    { id: 'tags', label: 'Tags' },
    { id: 'fonts', label: 'Fonts' },
    { id: 'colors', label: 'Colors' },
    { id: 'technologies', label: 'Technologies' },
  ];

  const websitesToggle = (
    <div className="flex p-1 rounded-full items-center" style={{ backgroundColor: 'var(--dv-surface-dark)' }}>
      <button 
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewType === 'websites' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'}`} 
        style={viewType === 'websites' ? { backgroundColor: 'var(--dv-text)', color: 'var(--dv-bg)' } : { color: 'var(--dv-text-ghost)' }}
        onClick={() => setViewType('websites')}
      >
        Websites
      </button>
      <button 
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewType === 'sections' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'}`} 
        style={viewType === 'sections' ? { backgroundColor: 'var(--dv-text)', color: 'var(--dv-bg)' } : { color: 'var(--dv-text-ghost)' }}
        onClick={() => setViewType('sections')}
      >
        Sections
      </button>
    </div>
  );

  return (
    <div className="websites-page font-polysans min-h-screen" style={{ backgroundColor: 'var(--dv-bg)', color: 'var(--dv-text)' }}>
      <WebsitesHeroV2 />
      <FilterBar 
        tabs={websitesTabs} 
        defaultActiveTab="categories" 
        rightElement={websitesToggle} 
      />
    </div>
  );
}
