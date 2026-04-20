import React from 'react';
import { Search } from 'lucide-react';

const NavbarSearch = () => {
    return (
        <div className="rd-navbar-search">
            <Search className="rd-search-icon" size={18} />
            <input 
                type="text" 
                placeholder="Search..." 
                className="rd-search-input"
            />
            <div className="rd-search-kbd">
                <span>Cmd</span>K
            </div>
        </div>
    );
};

export default NavbarSearch;
