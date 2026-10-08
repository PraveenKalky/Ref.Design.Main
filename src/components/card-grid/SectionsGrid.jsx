import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { 
  BookmarkSimple, 
  CopySimple, 
  DownloadSimple, 
  ArrowUpRight 
} from '@phosphor-icons/react';
import { MoreVertical, Pencil, Trash2, X, Check, LayoutTemplate } from 'lucide-react';
import Pagination from '../pagination/Pagination';
import { sanitizeSectionName } from '../../pages/admin/components/PageMediaUploader';
import { updateSectionTitleInDB, deleteSectionFromDB } from '../../utils/sectionActions';
import '../../components/navbar/login-modal.css';
import './card-grid.css';

export const SectionCard = ({ 
  id, 
  section_type, 
  section_title, 
  image_url, 
  page_url, 
  parentWebsite,
  onToast,
  onUpdateSection,
  onDeleteSection
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_sections') || '{}');
      return !!saved[id || image_url];
    } catch (e) {
      return false;
    }
  });
  const [toasts, setToasts] = useState([]);
  const menuRef = useRef(null);

  const addToast = (message, type = 'success') => {
    const toastId = Date.now() + Math.random();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3500);
  };

  // Display title directly without auto-sanitizing original filename (with bulletproof type safety)
  const strTitle = typeof section_title === 'string' ? section_title.trim() : (typeof section_type === 'string' ? section_type.trim() : '');
  const cleanTitle = strTitle || 'Section';
  const displayTitle = cleanTitle;
  
  const strType = typeof section_type === 'string' ? section_type.trim() : '';
  const displayCategory = (strType && strType !== 'Custom' && !displayTitle.toLowerCase().includes(strType.toLowerCase()))
    ? strType
    : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleToggleSave = (e) => {
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    const triggerToast = onToast || addToast;
    try {
      const saved = JSON.parse(localStorage.getItem('saved_sections') || '{}');
      if (nextState) {
        saved[id || image_url] = true;
        triggerToast('Saved');
      } else {
        delete saved[id || image_url];
        triggerToast('Removed from saved', 'info');
      }
      localStorage.setItem('saved_sections', JSON.stringify(saved));
    } catch (err) {
      triggerToast(nextState ? 'Saved' : 'Removed from saved');
    }
  };

  const handleCopyImage = async (e) => {
    e.stopPropagation();
    const triggerToast = onToast || addToast;
    try {
      const response = await fetch(image_url, { mode: 'cors' });
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();

      const img = new Image();
      img.crossOrigin = 'anonymous';
      const objectUrl = URL.createObjectURL(blob);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 800;
      canvas.height = img.naturalHeight || img.height || 600;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(async (pngBlob) => {
        if (pngBlob && navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': pngBlob })
            ]);
            triggerToast('Image copied');
          } catch (clipErr) {
            await navigator.clipboard.writeText(image_url);
            triggerToast('Image copied');
          }
        } else {
          await navigator.clipboard.writeText(image_url);
          triggerToast('Image copied');
        }
      }, 'image/png');
    } catch (err) {
      try {
        await navigator.clipboard.writeText(image_url);
        triggerToast('Image copied');
      } catch (err2) {
        triggerToast('Failed to copy image', 'error');
      }
    }
  };

  const handleDownloadImage = async (e) => {
    e.stopPropagation();
    const triggerToast = onToast || addToast;
    triggerToast('Download started');
    try {
      const resp = await fetch(image_url);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = image_url.split('.').pop().split('?')[0] || 'png';
      const safeName = (cleanTitle || 'section-image').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      a.download = `${safeName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      const a = document.createElement('a');
      a.href = image_url;
      a.download = 'section-image.png';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleOpenRename = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setRenameInput(cleanTitle);
    setShowRenameModal(true);
  };

  const handleOpenDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleSaveRename = async (e) => {
    e?.preventDefault();
    if (!renameInput.trim()) return;
    setIsSubmitting(true);

    const updatedTitle = sanitizeSectionName(renameInput) || renameInput.trim();
    const triggerToast = onToast || addToast;
    
    // Immediate UI update
    if (onUpdateSection) {
      onUpdateSection(id, { section_title: updatedTitle, section_type: updatedTitle });
    }

    // Persist to DB
    await updateSectionTitleInDB({ id, image_url }, updatedTitle);

    setIsSubmitting(false);
    setShowRenameModal(false);
    triggerToast('Section renamed');
  };

  const handleConfirmDelete = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    const triggerToast = onToast || addToast;

    // Immediate UI update
    if (onDeleteSection) {
      onDeleteSection(id);
    }

    // Persist to DB
    await deleteSectionFromDB({ id, image_url });

    setIsSubmitting(false);
    setShowDeleteModal(false);
    triggerToast('Section deleted');
  };

  return (
    <div className="card-container" style={{ textDecoration: 'none', position: 'relative' }}>
      <div className="card-image-wrapper">
        <img src={image_url} alt={cleanTitle} className="card-image" style={{ objectFit: 'contain', backgroundColor: '#0a0a0a' }} />
        
        {/* Card Overlay & Bottom Center Action Bar (No Tooltips, 4 Circles) */}
        <div className="card-overlay">
          <div className="card-action-bar" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className={`card-action-btn-icon ${isSaved ? 'is-saved' : ''}`}
              onClick={handleToggleSave}
              aria-label="Save"
            >
              {isSaved ? <BookmarkSimple size={18} weight="fill" /> : <BookmarkSimple size={18} />}
            </button>

            <button 
              type="button" 
              className="card-action-btn-icon"
              onClick={handleCopyImage}
              aria-label="Copy image"
            >
              <CopySimple size={18} />
            </button>

            <button 
              type="button" 
              className="card-action-btn-icon"
              onClick={handleDownloadImage}
              aria-label="Download image"
            >
              <DownloadSimple size={18} />
            </button>

            <button 
              type="button" 
              className="card-action-btn-icon"
              onClick={(e) => { e.stopPropagation(); window.open(page_url || image_url, '_blank'); }}
              aria-label="Open"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        {/* Compact ••• Action Menu Button */}
        <div className="card-menu-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button 
            type="button" 
            className="card-menu-btn" 
            onClick={() => setShowMenu(prev => !prev)}
            title="Options"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="card-dropdown-menu">
              <button type="button" className="card-dropdown-item" onClick={handleOpenRename}>
                <Pencil size={14} /> Rename
              </button>
              <button type="button" className="card-dropdown-item delete-item" onClick={handleOpenDelete}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-meta" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-text-container" style={{ flex: 1 }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {displayCategory && (
              <span style={{ 
                backgroundColor: 'var(--dv-surface-dark, #262626)', 
                color: 'var(--dv-text, #fff)', 
                fontSize: '11px', 
                fontWeight: 600, 
                padding: '2px 6px', 
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {displayCategory}
              </span>
            )}
            <span>{displayTitle}</span>
          </div>
          <div className="card-subtitle" style={{ fontSize: '12px', opacity: 0.7 }}>
            {parentWebsite?.title || parentWebsite?.normalised_url || (page_url ? (() => {
              try { return new URL(page_url).hostname.replace(/^www\./, ''); } catch (e) { return page_url; }
            })() : 'Standalone Section')}{strType && strType !== 'Custom' && strType !== 'Other' ? ` • ${strType}` : ''}
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="section-modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="section-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="section-modal-header">
              <h3>Rename Section</h3>
              <button type="button" className="section-modal-close" onClick={() => setShowRenameModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRename}>
              <div className="section-modal-body">
                <label>Section Name</label>
                <input 
                  type="text" 
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  placeholder="e.g. Sign In, Hero, Features"
                  autoFocus
                  required
                />
              </div>
              <div className="section-modal-footer">
                <button type="button" className="section-modal-btn section-modal-btn-cancel" onClick={() => setShowRenameModal(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="section-modal-btn section-modal-btn-primary" disabled={isSubmitting || !renameInput.trim()}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="section-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="section-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="section-modal-header">
              <h3>Delete section?</h3>
              <button type="button" className="section-modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="section-modal-body">
              <p>This will remove this uploaded asset and its section data.</p>
            </div>
            <div className="section-modal-footer">
              <button type="button" className="section-modal-btn section-modal-btn-cancel" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="button" className="section-modal-btn section-modal-btn-danger" onClick={handleConfirmDelete} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ref.Design Toast Feedback Container (Portaled to document.body for bottom-center viewport alignment) */}
      {toasts.length > 0 && typeof document !== 'undefined' && createPortal(
        <div className="lm-toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="lm-toast">
              <div className={`lm-toast-icon lm-toast-${toast.type || 'success'}`}>
                {toast.type === 'error' ? <X size={13} strokeWidth={2.5} /> : <Check size={13} strokeWidth={2.5} />}
              </div>
              <span className="lm-toast-msg">{toast.message}</span>
              <button 
                type="button" 
                className="lm-toast-close" 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default function SectionsGrid({ selectedCategory }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const cardsPerPage = 24;

  const addToast = (message, type = 'success') => {
    const toastId = Date.now() + Math.random();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3500);
  };

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

  const handleUpdateSection = (id, updatedFields) => {
    setSections(prev => prev.map(sec => sec.id === id ? { ...sec, ...updatedFields } : sec));
  };

  const handleDeleteSection = (id) => {
    setSections(prev => prev.filter(sec => sec.id !== id));
  };

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
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onToast={addToast}
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

      {/* Global Ref.Design Toaster Container (Bottom Center Fixed via Portal) */}
      {toasts.length > 0 && typeof document !== 'undefined' && createPortal(
        <div className="lm-toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="lm-toast">
              <div className={`lm-toast-icon lm-toast-${toast.type || 'success'}`}>
                {toast.type === 'error' ? <X size={13} strokeWidth={2.5} /> : <Check size={13} strokeWidth={2.5} />}
              </div>
              <span className="lm-toast-msg">{toast.message}</span>
              <button 
                type="button" 
                className="lm-toast-close" 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </section>
  );
}
