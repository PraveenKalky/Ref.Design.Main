import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { cardsData } from '../../components/card-grid/cards-data';
import WebsiteOverview from './components/WebsiteOverview';
import WebsitePreviewPanel from './components/WebsitePreviewPanel';
import { SectionCard } from '../../components/card-grid/SectionsGrid';
import WebsiteMetadataPanel from './components/WebsiteMetadataPanel';
import { classifySection } from '../../utils/sectionTaxonomy';
import './WebsiteDetailPage.css';
import dummyImage from '../../assets/dummy-preview.jpg';

import { supabase } from '../../lib/supabase';

export default function WebsiteDetailPage({ savedItems, toggleSave }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [website, setWebsite] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'sections'
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const toastId = Date.now() + Math.random();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3500);
  };

  useEffect(() => {
    const fetchWebsiteData = async () => {
      setLoading(true);
      try {
        // 1. Try local mock data first
        const foundWebsite = cardsData.find(c => c.name === slug || String(c.id) === slug);
        let currentWebsite = foundWebsite;
        
        if (foundWebsite) {
          document.title = `${foundWebsite.title} | Ref.Design`;
          setSections([]);
        } else {
          // 2. Fetch from Supabase (Supporting both UUID id and normalised_url slug)
          const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);
          let query = supabase.from('submissions').select('*');
          if (isUuid) {
            query = query.eq('id', slug);
          } else {
            query = query.or(`normalised_url.eq.${slug},url.ilike.%${slug}%`);
          }

          const { data, error } = await query.limit(1).maybeSingle();

          if (error || !data) {
            console.error('Website not found:', error);
            setWebsite(null);
            setLoading(false);
            return;
          }

          const websiteId = data.id;

          currentWebsite = {
            id: data.id,
            name: data.normalised_url,
            title: data.title,
            subtitle: data.description || data.normalised_url,
            image: data.fullpage_image_url || data.image_url || data.thumbnail_url,
            logo: data.logo_url || `https://www.google.com/s2/favicons?domain=${data.normalised_url || data.url}&sz=128`,
            link: data.url,
            categories: data.categories || [],
            styles: data.styles || data.style || null,
            industries: data.industries || data.industry || null,
            type: data.type || null,
            fonts: data.fonts || data.fonts_in_use || null,
            created_at: data.created_at || null
          };
          
          document.title = `${currentWebsite.title} | Ref.Design`;
          
          let compiledSections = [];

          // 3. Fetch standalone / captured sections from website_sections table
          const { data: dbSecData } = await supabase
            .from('website_sections')
            .select('*')
            .eq('website_id', websiteId)
            .order('sort_order', { ascending: true });

          if (dbSecData && dbSecData.length > 0) {
            dbSecData.forEach(sec => {
              const classification = classifySection(sec.section_title || sec.section_type || '');
              compiledSections.push({
                id: sec.id,
                section_type: sec.section_type || classification.category || 'Section',
                section_title: sec.section_title || classification.title || 'Section',
                category: sec.category || classification.category,
                tags: Array.isArray(sec.tags) ? sec.tags : classification.tags,
                image_url: sec.image_url,
                page_url: sec.page_url || data.url
              });
            });
          }

          // 4. Fetch sections from website_pages media
          const { data: pagesData } = await supabase
            .from('website_pages')
            .select('media, url')
            .eq('website_id', websiteId)
            .order('sort_order', { ascending: true });
            
          if (pagesData && pagesData.length > 0) {
            pagesData.forEach(page => {
              if (page.media && Array.isArray(page.media)) {
                page.media.forEach((m, idx) => {
                  const mediaUrl = (m && typeof m === 'object') ? (m.thumbnailUrl || m.url || '') : (typeof m === 'string' ? m : '');
                  const classification = classifySection(m.filename || m.title || '');
                  const mediaTitle = (m && typeof m === 'object' && m.title && m.title !== 'Deposit' && m.title !== 'Deposite')
                    ? m.title
                    : (classification.title || 'Section');
                  const mediaCategory = (m && typeof m === 'object' && m.category) ? m.category : classification.category;
                  const mediaTags = (m && typeof m === 'object' && Array.isArray(m.tags) && m.tags.length > 0) ? m.tags : classification.tags;
                  
                  // Avoid duplicate entry if already present in dbSecData
                  if (!compiledSections.some(s => s.image_url === mediaUrl)) {
                    compiledSections.push({
                      id: (m && m.url) || `${page.url}-${idx}`,
                      section_type: mediaCategory || mediaTitle,
                      section_title: mediaTitle,
                      category: mediaCategory,
                      tags: mediaTags,
                      image_url: mediaUrl,
                      page_url: page.url
                    });
                  }
                });
              }
            });
          }

          setSections(compiledSections);
        }
        
        setWebsite(currentWebsite);
      } catch (err) {
        console.error('Error fetching website data:', err);
        setWebsite(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteData();
  }, [slug]);

  if (loading) {
    return (
      <div className="website-detail-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--dv-text)', fontSize: '15px' }}>Loading website details...</p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="website-detail-page" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <h2 style={{ color: 'var(--dv-text)', margin: 0 }}>Website Not Found</h2>
        <button 
          onClick={() => navigate('/websites')} 
          style={{ 
            padding: '8px 16px', 
            borderRadius: '8px', 
            backgroundColor: 'var(--dv-text)', 
            color: 'var(--dv-bg)', 
            border: 'none', 
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Back to Websites
        </button>
      </div>
    );
  }

  return (
    <div className="website-detail-page">
      <div className="website-detail-content">
        <WebsiteOverview 
          website={website} 
          isSaved={!!(savedItems && savedItems[website.id])}
          toggleSave={toggleSave}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        
        <div className="website-detail-body">
          {viewMode === 'preview' ? (
            <div className="preview-mode-layout">
              <WebsitePreviewPanel 
                website={website} 
                isSaved={!!(savedItems && savedItems[website.id])}
                toggleSave={toggleSave}
              />
            </div>
          ) : (
            <div className="sections-grid-container">
              {sections.length === 0 ? (
                <div className="empty-sections-state">
                  <p>No sections available for this website.</p>
                </div>
              ) : (
                <div className="card-grid">
                  {sections.map((sec) => (
                    <SectionCard 
                      key={sec.id} 
                      id={sec.id}
                      section_type={sec.section_type}
                      section_title={sec.section_title}
                      image_url={sec.image_url}
                      page_url={sec.page_url}
                      parentWebsite={website}
                      onToast={addToast}
                      onUpdateSection={(id, updatedFields) => {
                        setSections(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
                      }}
                      onDeleteSection={(id) => {
                        setSections(prev => prev.filter(s => s.id !== id));
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
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
