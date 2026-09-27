import React, { useState } from 'react';
import { Bookmark, Moon, Sun, User, LogOut, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginModal from './LoginModal';
import { Link } from 'react-router-dom';

const NavbarActions = ({ savedCount, theme, toggleTheme }) => {
  const { user, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Get initials from user metadata or email
  const getInitials = () => {
    if (!user) return null;
    const username = user.user_metadata?.username;
    if (username) return username.slice(0, 2).toUpperCase();
    const email = user.email || '';
    return email.slice(0, 2).toUpperCase();
  };

  const handleUserClick = () => {
    if (user) return; // logged in — no modal
    setIsLoginOpen(true);
  };

  const handleSignOut = async () => {
    try { await signOut(); } catch (e) { console.error(e); }
  };

  React.useEffect(() => {
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener('open-login', handleOpenLogin);
    return () => window.removeEventListener('open-login', handleOpenLogin);
  }, []);

  return (
    <>
      <div className="nav-right">
        <div className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </div>

        <div className="icon-btn" title={`Saved: ${savedCount || 0}`}>
          <Bookmark size={18} />
          {savedCount > 0 && (
            <span className="nav-saved-badge">{savedCount}</span>
          )}
        </div>

        <Link to="/submit" className="submit-pill" style={{ textDecoration: 'none' }}>Submit</Link>

        {user ? (
          /* ── Logged-in state ── */
          <div className="nav-user-group">
            <Link to="/changelog" className="icon-btn" title="Changelog" style={{ textDecoration: 'none', color: 'inherit' }}>
              <History size={18} />
            </Link>
            <div className="user-avatar-circle user-avatar-circle--active" title={user.email}>
              {getInitials()}
            </div>
            <button
              className="icon-btn nav-signout-btn"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          /* ── Logged-out state ── */
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/changelog" className="icon-btn" title="Changelog" style={{ textDecoration: 'none', color: 'inherit' }}>
              <History size={18} />
            </Link>
            <div
              className="user-avatar-circle"
              onClick={handleUserClick}
              style={{ cursor: 'pointer' }}
              title="Log in"
            >
              <User size={18} />
            </div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default NavbarActions;
