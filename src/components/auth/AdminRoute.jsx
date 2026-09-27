import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading auth...</div>;
  
  // Basic admin check - in production you might check against a list of emails from env
  // or a role in Supabase. We are currently the only admin.
  // We'll allow access if user is logged in for now, but you should refine this check.
  // const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'your_admin_email@example.com';
  // if (!user || user.email !== ADMIN_EMAIL) {
  
  if (!user) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Admin Access Required</h2>
        <p>Please log in using the profile icon in the navigation bar to access the Admin Panel.</p>
      </div>
    );
  }

  // Future strict check:
  // const adminEmails = ['your@email.com'];
  // if (!adminEmails.includes(user.email)) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
