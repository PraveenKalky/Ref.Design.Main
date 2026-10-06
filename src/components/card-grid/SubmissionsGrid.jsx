import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from './CardGrid';
import Pagination from '../pagination/Pagination';
import './card-grid.css';

export default function SubmissionsGrid({ selectedCategory }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchError, setFetchError] = useState(null);

  // Bulk action states
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const cardsPerPage = 24;

  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory && selectedCategory !== 'All') {
        query = query.contains('categories', [selectedCategory]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching submissions:", error);
        setFetchError(error.message || JSON.stringify(error));
      } else {
        setSubmissions(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setFetchError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSubmissions();

    // Setup Supabase Realtime channel for live capture updates
    const channel = supabase
      .channel('submissions_realtime_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSubmissions((prev) => {
              if (prev.some((item) => item.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setSubmissions((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setSubmissions((prev) =>
              prev.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory]);

  const handleDeleteSubmission = async (websiteId) => {
    try {
      const target = submissions.find(s => s.id === websiteId);

      const { data, error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', websiteId)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("You do not have permission to delete this submission (RLS blocked the action).");
      }

      // Clean up associated storage files
      if (target) {
        const pathsToDelete = [];
        const extractPath = (url) => {
          if (!url) return null;
          const parts = url.split('/submissions/');
          return parts.length > 1 ? parts[1] : null;
        };
        
        [target.image_url, target.logo_url, target.thumbnail_url, target.fullpage_image_url].forEach(url => {
          const path = extractPath(url);
          if (path) pathsToDelete.push(path);
        });
        
        if (target.media && Array.isArray(target.media)) {
          target.media.forEach(url => {
            const path = extractPath(url);
            if (path) pathsToDelete.push(path);
          });
        }

        if (pathsToDelete.length > 0) {
          await supabase.storage.from('submissions').remove(pathsToDelete);
        }
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== websiteId));
      setSelectedIds((prev) => prev.filter((id) => id !== websiteId));
    } catch (err) {
      console.error('Failed to delete submission:', err);
      alert(`Failed to delete website: ${err.message}`);
    }
  };

  const handleToggleSelect = (websiteId) => {
    setSelectedIds((prev) => 
      prev.includes(websiteId)
        ? prev.filter((id) => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected website cards permanently?`)) return;

    try {
      const { data, error } = await supabase
        .from('submissions')
        .delete()
        .in('id', selectedIds)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("You do not have permission to delete these submissions (RLS blocked the action).");
      }

      const pathsToDelete = [];
      const extractPath = (url) => {
        if (!url) return null;
        const parts = url.split('/submissions/');
        return parts.length > 1 ? parts[1] : null;
      };

      data.forEach(target => {
        [target.image_url, target.logo_url, target.thumbnail_url, target.fullpage_image_url].forEach(url => {
          const path = extractPath(url);
          if (path) pathsToDelete.push(path);
        });
        if (target.media && Array.isArray(target.media)) {
          target.media.forEach(url => {
            const path = extractPath(url);
            if (path) pathsToDelete.push(path);
          });
        }
      });

      if (pathsToDelete.length > 0) {
        await supabase.storage.from('submissions').remove(pathsToDelete);
      }

      const deletedIds = data.map(row => row.id);
      setSubmissions((prev) => prev.filter((item) => !deletedIds.includes(item.id)));
      setSelectedIds([]);
      setIsSelectMode(false);
      
      if (deletedIds.length < selectedIds.length) {
         alert(`Only ${deletedIds.length} of ${selectedIds.length} were deleted due to permissions.`);
      }
    } catch (err) {
      console.error('Failed bulk delete:', err);
      alert(`Failed to delete selected websites: ${err.message}`);
    }
  };

  const totalPages = Math.ceil(submissions.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = submissions.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (fetchError) {
    return (
      <section className="card-grid-section" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        <p>Error fetching: {fetchError}</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="card-grid-section" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading captured websites...</p>
      </section>
    );
  }

  if (submissions.length === 0) {
    return (
      <section className="card-grid-section" style={{ minHeight: '50vh', display: 'flex', flexCol: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
        <p>No websites captured yet. Use the Chrome Extension to save some!</p>
        <small style={{ marginTop: '10px' }}>Debug: Supabase URL is {import.meta.env.VITE_SUPABASE_URL}</small>
      </section>
    );
  }

  return (
    <section className="card-grid-section">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button 
          type="button"
          onClick={() => {
            setIsSelectMode(!isSelectMode);
            if (isSelectMode) setSelectedIds([]);
          }}
          className="admin-modal-btn admin-modal-btn-cancel"
          style={{ fontSize: '13px', padding: '6px 14px' }}
        >
          {isSelectMode ? 'Cancel Bulk Select' : 'Manage / Bulk Select'}
        </button>
      </div>

      <div className="card-grid">
        {currentCards.map((sub) => (
          <Card 
            key={sub.id} 
            id={sub.id}
            name={sub.id}
            title={sub.title}
            subtitle={sub.description || sub.normalised_url}
            image={sub.image_url}
            logo={sub.logo_url || `https://www.google.com/s2/favicons?domain=${sub.normalised_url || sub.url}&sz=128`}
            link={sub.url}
            isSaved={false}
            toggleSave={() => {}}
            onDelete={handleDeleteSubmission}
            isSelectMode={isSelectMode}
            isSelected={selectedIds.includes(sub.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      {isSelectMode && selectedIds.length > 0 && (
        <div className="bulk-actions-floating-bar">
          <span><strong>{selectedIds.length}</strong> website{selectedIds.length > 1 ? 's' : ''} selected</span>
          <button 
            type="button" 
            onClick={() => setSelectedIds([])}
            className="admin-modal-btn admin-modal-btn-cancel"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Clear Selection
          </button>
          <button 
            type="button" 
            onClick={handleBulkDelete}
            className="admin-modal-btn admin-modal-btn-danger"
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </section>
  );
}
