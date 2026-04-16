import React from 'react';
import { Search } from 'lucide-react';

const NavbarSearch = () => {
  return (
    <div className="search-container">
      <Search size={18} className="lucide-search" />
      <input 
        type="text" 
        placeholder="Search Websites, Screens, UI Elements, Flows" 
      />
    </div>
  );
};

export default NavbarSearch;
