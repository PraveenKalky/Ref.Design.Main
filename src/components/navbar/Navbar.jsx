import React from 'react';
import NavbarBrand from './NavbarBrand';
import NavbarTabs from './NavbarTabs';
import NavbarActions from './NavbarActions';
import './navbar.css';

const Navbar = ({ savedCount, theme, toggleTheme }) => {
  return (
    <header className="navbar-header">
      <nav className="navbar-nav">
        <NavbarBrand />
        <NavbarTabs />
        <NavbarActions savedCount={savedCount} theme={theme} toggleTheme={toggleTheme} />
      </nav>
    </header>
  );
};

export default Navbar;
