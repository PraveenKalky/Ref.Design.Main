import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowUpRight, Bookmark, LayoutTemplate } from 'lucide-react';
import Pagination from '../pagination/Pagination';
import './card-grid.css';

export const SectionCard = ({ id, section_type, section_title, image_url, page_url, parentWebsite }) => {
  return (
    <div className="card-container" style={{ textDecoration: 'none' }}>
      <div className="card-image-wrapper">
        <img src={image_url} alt={section_title || section_type} className="card-image" style={{ objectFit: 'contain', backgroundColor: '#0a0a0a' }} />
        <div className="card-overlay">
          <div className="card-actions">
            <button 
              onClick={(e) => { e.stopPropagation(); window.open(page_url, '_blank'); }}
              className="card-action-btn card-action-open"
              title="Open page"
            >
              <ArrowUpRight strokeWidth={2} size={18} /> Open
            </button>
          </div>
        </div>
      </div>
      <div className="card-meta" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-text-container" style={{ flex: 1 }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              backgroundColor: 'var(--dv-surface-dark, #262626)', 
              color: 'var(--dv-text, #fff)', 
              fontSize: '11px', 
              fontWeight: 600, 
              padding: '2px 6px', 
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {section_type}
            </span>
            <span>{section_title || section_type}</span>
          </div>
          <div className="card-subtitle" style={{ fontSize: '12px', opacity: 0.7 }}>
            {parentWebsite?.title || parentWebsite?.normalised_url || 'Website Section'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SectionsGrid({ selectedCategory }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 24;

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('website_sections')
          .select(`
            id,
            section_type,
            section_title,
            image_url,
            page_url,
            created_at,
            submissions:website_id (
              id,
              title,
              normalised_url,
              logo_url
            )
          `)
          .order('created_at', { ascending: false });

        if (selectedCategory) {
          query = query.ilike('section_type', `%${selectedCategory}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching sections:", error);
          setFetchError(error.message || JSON.stringify(error));
        } else {
          setSections(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch sections:", err);
        setFetchError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [selectedCategory]);

  const totalPages = Math.ceil(sections.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = sections.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (fetchError) {
    return (
      <section className="card-grid-section" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        <p>Error fetching sections: {fetchError}</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="card-grid-section" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading captured sections...</p>
      </section>
    );
  }

  if (sections.length === 0) {
    return (
      <section className="card-grid-section" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
        <LayoutTemplate size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
        <p style={{ fontWeight: 500 }}>No sections captured yet.</p>
        <p style={{ fontSize: '13px', marginTop: 4 }}>Use the Ref.Design Extension with "Capture Section" to clip Hero, Pricing, or Bento Grid sections!</p>
      </section>
    );
  }

  return (
    <section className="card-grid-section">
      <div className="card-grid">
        {currentCards.map((sec) => (
          <SectionCard 
            key={sec.id} 
            id={sec.id}
            section_type={sec.section_type}
            section_title={sec.section_title}
            image_url={sec.image_url}
            page_url={sec.page_url}
            parentWebsite={sec.submissions}
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
