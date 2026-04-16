import React, { useState, useEffect } from 'react';
import { Bookmark, Moon, Sun, User } from 'lucide-react';

const NavbarActions = ({ savedCount }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="nav-right">
      <div className="icon-btn" onClick={toggleTheme}>
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </div>
      
      <div className="icon-btn" title={`Saved: ${savedCount || 0}`}>
        <Bookmark size={18} />
      </div>

      <button className="submit-pill">Submit</button>

      <div className="user-avatar-circle">
        <User size={18} />
      </div>
    </div>
  );
};

export default NavbarActions;
