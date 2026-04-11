import React from 'react';

const NavbarTabs = () => {
  const tabs = [
    { label: 'Flows', active: true },
    { label: 'Components', active: false },
    { label: 'Collections', active: false },
    { label: 'Curated', active: false },
  ];

  return (
    <nav className="navbar-tabs">
      {tabs.map((tab) => (
        <a 
          key={tab.label} 
          href={`/${tab.label.toLowerCase()}`} 
          className={`navbar-tab-item ${tab.active ? 'active' : ''}`}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
};

export default NavbarTabs;
