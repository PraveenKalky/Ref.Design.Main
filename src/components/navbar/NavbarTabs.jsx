import React, { useState } from 'react';
import { Search } from 'lucide-react';

const NavbarTabs = () => {
    // Single source of truth for all nav links
    const [activeLink, setActiveLink] = useState('Home');

    const navLinks = ['Home', 'Websites', 'Apps', 'Resources', 'Fonts', 'UI/UX Tastes', 'Search'];

    return (
        <div className="nav-center">
            {navLinks.map((link) => (
                <button 
                    key={link}
                    className={`nav-link ${activeLink === link ? 'active' : ''}`}
                    onClick={() => setActiveLink(link)}
                >
                    {link === 'Search' && <Search size={16} />}
                    {link}
                </button>
            ))}
        </div>
    );
};

export default NavbarTabs;
