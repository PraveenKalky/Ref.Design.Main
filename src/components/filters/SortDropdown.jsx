import React from 'react';
import { ChevronDown } from 'lucide-react';

const SortDropdown = () => {
  return (
    <div className="sort-dropdown">
      <span>Sort by: Trending</span>
      <ChevronDown size={16} />
    </div>
  );
};

export default SortDropdown;
