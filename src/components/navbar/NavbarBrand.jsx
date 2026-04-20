import React from 'react';
import NavbarSearch from './NavbarSearch';

const NavbarBrand = () => {
  return (
    <div className="nav-left">
      <div className="rf-avatar">RD</div>
      <NavbarSearch />
    </div>
  );
};

export default NavbarBrand;
