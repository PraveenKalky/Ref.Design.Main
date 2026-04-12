import React from 'react';
import FilterChips from './FilterChips';
import SortDropdown from './SortDropdown';
import FilterDrawer from './FilterDrawer';
import './filters.css';

const FilterBar = () => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <FilterDrawer />
        <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
        <FilterChips />
      </div>
      <SortDropdown />
    </div>
  );
};

export default FilterBar;
