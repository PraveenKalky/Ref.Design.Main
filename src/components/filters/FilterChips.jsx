import React from 'react';

const FilterChips = () => {
  const categories = [
    { label: 'All', active: true },
    { label: 'SaaS', active: false },
    { label: 'E-commerce', active: false },
    { label: 'Fintech', active: false },
    { label: 'Healthcare', active: false },
    { label: 'Travel', active: false },
    { label: 'Education', active: false },
    { label: 'Gaming', active: false },
    { label: 'Web3', active: false },
  ];

  return (
    <div className="filter-chips">
      {categories.map((cat) => (
        <button 
          key={cat.label} 
          className={`filter-chip ${cat.active ? 'active' : ''}`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
