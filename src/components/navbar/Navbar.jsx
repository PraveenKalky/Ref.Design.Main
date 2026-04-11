import React from 'react';
import NavbarBrand from './NavbarBrand';
import NavbarSearch from './NavbarSearch';
import NavbarTabs from './NavbarTabs';
import NavbarActions from './NavbarActions';
import './navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <NavbarBrand />
      <NavbarSearch />
      <NavbarTabs />
      <NavbarActions />
    </header>
  );
};

export default Navbar;
