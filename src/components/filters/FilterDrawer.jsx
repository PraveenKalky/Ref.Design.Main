import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const FilterDrawer = () => {
  return (
    <button className="filter-drawer-trigger">
      <SlidersHorizontal size={16} />
      <span>All Filters</span>
    </button>
  );
};

export default FilterDrawer;
