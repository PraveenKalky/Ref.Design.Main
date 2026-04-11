import React from 'react';
import { Bookmark, User } from 'lucide-react';

const NavbarActions = () => {
  return (
    <div className="navbar-actions">
      <button className="btn-secondary" style={{ padding: '0.5rem', display: 'flex' }}>
        <Bookmark size={20} />
      </button>
      <button className="btn-primary">
        Post Design
      </button>
      <button className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
        <User size={20} />
      </button>
    </div>
  );
};

export default NavbarActions;
