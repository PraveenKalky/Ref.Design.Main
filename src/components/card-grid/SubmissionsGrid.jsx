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
              prev.filter((item) => item.id === payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory]);

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
          />
        ))}
      </div>
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
