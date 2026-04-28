import React, { useState } from 'react';
import { Bookmark, Moon, Sun, User } from 'lucide-react';
import LoginModal from './LoginModal';

const NavbarActions = ({ savedCount, theme, toggleTheme }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <div className="nav-right">
        <div className="icon-btn" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </div>

        <div className="icon-btn" title={`Saved: ${savedCount || 0}`}>
          <Bookmark size={18} />
        </div>

        <button className="submit-pill">Submit</button>

        <div
          className="user-avatar-circle"
          onClick={() => setIsLoginOpen(true)}
          style={{ cursor: 'pointer' }}
          title="Log in"
        >
          <User size={18} />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default NavbarActions;
