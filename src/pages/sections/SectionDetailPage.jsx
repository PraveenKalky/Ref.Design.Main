import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookmarkSimple, 
  CopySimple, 
  DownloadSimple, 
  ArrowUpRight, 
  ArrowsOut, 
  X, 
  Check, 
  Globe, 
  TagSimple,
  Sparkle
} from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';
import { SectionCard } from '../../components/card-grid/SectionsGrid';
import { sanitizeSectionName } from '../admin/components/PageMediaUploader';
import { classifySection } from '../../utils/sectionTaxonomy';
import './section-detail.css';

export default function SectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  const [relatedSections, setRelatedSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });

  const addToast = useCallback((message, type = 'success') => {
    const toastId = Date.now() + Math.random();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4000);
  }, []);

  // Fetch Section Data
  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        let resolvedSection = null;

        // 1. Try website_sections table (only if valid UUID)
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
        if (isUuid) {
          const { data } = await supabase
            .from('website_sections')
            .select(`
              id,
              section_type,
              section_title,
              image_url,
              thumbnail_url,
              page_url,
              website_url,
              is_standalone,
              tags,
              description,
              created_at,
              submissions:website_id (
                id,
                title,
                normalised_url,
                url,
                logo_url,
                image_url
              )
            `)
            .eq('id', id)
            .maybeSingle();

          if (data) {
            const classification = classifySection(data.section_title || data.section_type || '');
            resolvedSection = {
              ...data,
              section_title: data.section_title || classification.title,
              section_type: data.section_type || classification.category,
              category: classification.category,
              tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : classification.tags
            };
          }
        }

        // 2. Fallback to website_pages media if not found
        if (!resolvedSection) {
          const { data: pageRows } = await supabase
            .from('website_pages')
            .select(`
              id,
              website_id,
              page_title,
              url,
              media,
              created_at,
              submissions:website_id (
                id,
                title,
                normalised_url,
                url,
                logo_url,
                image_url
              )
            `);

          if (pageRows) {
            for (const page of pageRows) {
              if (Array.isArray(page.media)) {
                const foundMedia = page.media.find((m, idx) => 
                  m.url === id || 
                  m.thumbnailUrl === id ||
                  `${page.id}-${idx}` === id || 
                  (m.filename && id.includes(m.filename))
                );
                if (foundMedia) {
                  const classification = classifySection(foundMedia.filename || foundMedia.title || '');
                  resolvedSection = {
                    id: foundMedia.url || id,
                    section_title: (foundMedia.title && foundMedia.title !== 'Deposit' && foundMedia.title !== 'Deposite') ? foundMedia.title : classification.title,
                    section_type: foundMedia.category || classification.category,
                    category: foundMedia.category || classification.category,
                    tags: (Array.isArray(foundMedia.tags) && foundMedia.tags.length > 0) ? foundMedia.tags : classification.tags,
                    image_url: foundMedia.url,
                    thumbnail_url: foundMedia.thumbnailUrl || foundMedia.url,
                    page_url: page.url,
                    website_url: page.url,
                    created_at: page.created_at,
                    submissions: page.submissions
                  };
                  break;
                }
              }
            }
          }
        }

        if (!resolvedSection) {
          console.error('Section not found:', id);
          navigate('/sections', { replace: true });
          return;
        }

        if (isMounted) {
          setSection(resolvedSection);
          document.title = `${resolvedSection.section_title || resolvedSection.section_type || 'Section'} | Ref.Design`;

          // Check if saved in localStorage
          try {
            const saved = JSON.parse(localStorage.getItem('saved_sections') || '{}');
            setIsSaved(!!saved[resolvedSection.id || resolvedSection.image_url]);
          } catch (e) {}

          // Fetch related sections from same category
          const categoryToMatch = resolvedSection.section_type || resolvedSection.category;
          const { data: related } = await supabase
            .from('website_sections')
            .select(`
              id,
              section_type,
              section_title,
              image_url,
              thumbnail_url,
              page_url,
              website_url,
              submissions:website_id (
                id,
                title,
                normalised_url,
                logo_url
              )
            `)
            .eq('section_type', categoryToMatch)
            .neq('id', resolvedSection.id)
            .eq('status', 'Approved')
            .limit(6);

          if (isMounted) {
            setRelatedSections(related || []);
          }
        }
      } catch (err) {
        console.error('Error fetching section detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [id, navigate]);

  // Handle Save
  const handleToggleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    try {
      const saved = JSON.parse(localStorage.getItem('saved_sections') || '{}');
      if (next) {
        saved[section.id || section.image_url] = true;
        addToast('Saved to your collection');
      } else {
        delete saved[section.id || section.image_url];
        addToast('Removed from saved', 'info');
      }
      localStorage.setItem('saved_sections', JSON.stringify(saved));
    } catch (e) {}
  };

  // Handle Copy Image
  const handleCopyImage = async () => {
    try {
      const resp = await fetch(section.image_url, { mode: 'cors' });
      const blob = await resp.blob();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const objUrl = URL.createObjectURL(blob);
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = objUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(objUrl);

      canvas.toBlob(async (pngBlob) => {
        if (pngBlob && navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
            addToast('Image copied to clipboard');
          } catch {
            await navigator.clipboard.writeText(section.image_url);
            addToast('Image URL copied');
          }
        } else {
          await navigator.clipboard.writeText(section.image_url);
          addToast('Image URL copied');
        }
      }, 'image/png');
    } catch {
      try {
        await navigator.clipboard.writeText(section.image_url);
        addToast('Image link copied');
      } catch {
        addToast('Failed to copy', 'error');
      }
    }
  };

  // Handle Download Image
  const handleDownload = async () => {
    addToast('Download started');
    try {
      const resp = await fetch(section.image_url);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = (section.section_title || section.section_type || 'section')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      a.download = `${cleanName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      window.open(section.image_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="section-detail-loading">
        <div className="sections-loading-spinner" />
        <p>Loading section details...</p>
      </div>
    );
  }

  if (!section) return null;

  const strTitle = typeof section.section_title === 'string' ? section.section_title.trim() : (typeof section.section_type === 'string' ? section.section_type.trim() : '');
  const cleanTitle = strTitle || 'Section';
  const strType = typeof section.section_type === 'string' ? section.section_type.trim() : '';
  const cleanType = (strType && strType.toLowerCase() !== cleanTitle.toLowerCase() && strType !== 'Custom')
    ? strType
    : null;
  const parentWebsite = section.submissions;
  const visitUrl = section.page_url || section.website_url || parentWebsite?.url;

  return (
    <div className="section-detail-page">
      {/* ── Top Header Navigation ── */}
      <div className="section-detail-header-bar">
        <div className="section-detail-header-inner">
          <button 
            type="button" 
            onClick={() => navigate('/sections')} 
            className="section-detail-back-btn"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Back to Sections</span>
          </button>

          <div className="section-detail-header-actions">
            <button 
              type="button" 
              className={`section-detail-action-btn ${isSaved ? 'active' : ''}`}
              onClick={handleToggleSave}
            >
              <BookmarkSimple size={18} weight={isSaved ? "fill" : "regular"} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button 
              type="button" 
              className="section-detail-action-btn"
              onClick={handleCopyImage}
            >
              <CopySimple size={18} />
              <span>Copy</span>
            </button>
            <button 
              type="button" 
              className="section-detail-action-btn"
              onClick={handleDownload}
            >
              <DownloadSimple size={18} />
              <span>Download</span>
            </button>
            {visitUrl && (
              <a 
                href={visitUrl} 
                target="_blank" 
                rel="noreferrer"
                className="section-detail-action-btn primary"
              >
                <span>Visit Source</span>
                <ArrowUpRight size={16} weight="bold" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Detail Container ── */}
      <div className="section-detail-container">
        {/* Title Meta */}
        <div className="section-detail-meta-row">
          <div>
            <div className="section-detail-badge-group">
              {cleanType && <span className="section-detail-type-badge">{cleanType}</span>}
              {parentWebsite?.title && (
                <span className="section-detail-website-tag">
                  from {parentWebsite.title}
                </span>
              )}
            </div>
            <h1 className="section-detail-title">{cleanTitle}</h1>
          </div>
        </div>

        {/* ── Full Screenshot Viewer ── */}
        <div className="section-detail-preview-frame">
          <div className="section-detail-preview-toolbar">
            <div className="section-detail-dimensions">
              {imgNaturalSize.width > 0 
                ? `${imgNaturalSize.width} × ${imgNaturalSize.height} px` 
                : 'Full Resolution'}
            </div>
            <button 
              type="button" 
              className="section-detail-fullscreen-btn"
              onClick={() => setIsFullscreen(true)}
              title="Expand to Fullscreen"
            >
              <ArrowsOut size={16} />
              <span>Fullscreen</span>
            </button>
          </div>

          <div className="section-detail-image-wrapper" onClick={() => setIsFullscreen(true)}>
            <img 
              src={section.image_url} 
              alt={cleanTitle} 
              className="section-detail-image"
              onLoad={(e) => {
                setImgNaturalSize({
                  width: e.target.naturalWidth,
                  height: e.target.naturalHeight
                });
              }}
            />
          </div>
        </div>

        {/* ── Metadata & Source Panel ── */}
        <div className="section-detail-info-grid">
          {/* Left card: Website Attribution */}
          {parentWebsite ? (
            <div className="section-detail-info-card">
              <h3 className="section-detail-card-title">Website Source</h3>
              <div className="section-detail-website-block">
                {parentWebsite.logo_url ? (
                  <img src={parentWebsite.logo_url} alt={parentWebsite.title} className="section-detail-source-logo" />
                ) : (
                  <div className="section-detail-source-logo-placeholder">
                    <Globe size={18} />
                  </div>
                )}
                <div>
                  <div className="section-detail-source-name">{parentWebsite.title}</div>
                  <div className="section-detail-source-url">{parentWebsite.normalised_url}</div>
                </div>
                <Link 
                  to={`/websites/${parentWebsite.normalised_url || parentWebsite.id}`}
                  className="section-detail-view-site-link"
                >
                  View Website <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ) : section.website_url ? (
            <div className="section-detail-info-card">
              <h3 className="section-detail-card-title">Source URL</h3>
              <div className="section-detail-website-block">
                <div className="section-detail-source-logo-placeholder">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="section-detail-source-name">{section.website_url}</div>
                  <div className="section-detail-source-url">Standalone Upload</div>
                </div>
                <a 
                  href={section.website_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="section-detail-view-site-link"
                >
                  Open Link <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          ) : null}

          {/* Right card: Description & Tags */}
          <div className="section-detail-info-card">
            <h3 className="section-detail-card-title">Section Details</h3>
            {section.description ? (
              <p className="section-detail-description">{section.description}</p>
            ) : (
              <p className="section-detail-description muted">
                High-resolution {cleanType.toLowerCase()} section captured and curated for Ref.Design.
              </p>
            )}

            {Array.isArray(section.tags) && section.tags.length > 0 && (
              <div className="section-detail-tags-wrap">
                <span className="section-detail-tags-label"><TagSimple size={13} /> Tags:</span>
                <div className="section-detail-tags-list">
                  {section.tags.map(t => (
                    <span key={t} className="section-detail-tag-pill">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Sections ── */}
        {relatedSections.length > 0 && (
          <div className="section-detail-related-section">
            <div className="section-detail-related-header">
              <h2 className="section-detail-related-title">
                More {cleanType} Sections
              </h2>
              <Link to={`/sections?category=${cleanType.toLowerCase()}`} className="section-detail-see-all-link">
                See all {cleanType} <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="sections-grid">
              {relatedSections.map(rel => (
                <div 
                  key={rel.id} 
                  className="sections-card-wrapper"
                  onClick={() => navigate(`/sections/${rel.id}`)}
                >
                  <SectionCard 
                    id={rel.id}
                    section_type={rel.section_type}
                    section_title={rel.section_title}
                    image_url={rel.thumbnail_url || rel.image_url}
                    page_url={rel.page_url || rel.website_url}
                    parentWebsite={rel.submissions}
                    onToast={addToast}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Fullscreen Lightbox Modal ── */}
      {isFullscreen && (
        <div className="section-detail-lightbox" onClick={() => setIsFullscreen(false)}>
          <button 
            type="button" 
            className="section-detail-lightbox-close"
            onClick={() => setIsFullscreen(false)}
          >
            <X size={24} weight="bold" />
          </button>
          <img 
            src={section.image_url} 
            alt={cleanTitle} 
            className="section-detail-lightbox-img" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* ── Toast Notifications ── */}
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
}
