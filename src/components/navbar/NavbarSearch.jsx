import React from 'react';
import { Search } from 'lucide-react';

const NavbarSearch = () => {
  return (
    <div className="navbar-search">
      <Search className="navbar-search-icon" size={18} />
      <input 
        type="text" 
        placeholder="Search design flows, components, or screens..." 
      />
    </div>
  );
};

export default NavbarSearch;
