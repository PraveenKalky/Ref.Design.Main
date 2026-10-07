import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cardsData } from '../../components/card-grid/cards-data';
import WebsiteOverview from './components/WebsiteOverview';
import WebsitePreviewPanel from './components/WebsitePreviewPanel';
import { SectionCard } from '../../components/card-grid/SectionsGrid';
import WebsiteMetadataPanel from './components/WebsiteMetadataPanel';
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
  const [sectionFilter, setSectionFilter] = useState('All');

  useEffect(() => {
    const fetchWebsiteData = async () => {
      setLoading(true);
      try {
        // Try local mock data first
        const foundWebsite = cardsData.find(c => c.name === slug || String(c.id) === slug);
        let currentWebsite = foundWebsite;
        
        if (foundWebsite) {
          document.title = `${foundWebsite.title} | Ref.Design`;
          setSections([]); // Mock data doesn't have sections
        } else {
          // Fetch from Supabase
          const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('id', slug)
            .single();

          if (error || !data) {
            console.error('Website not found:', error);
            navigate('/websites', { replace: true });
            return;
          }

          currentWebsite = {
            id: data.id,
            name: data.normalised_url,
            title: data.title,
            subtitle: data.description || data.normalised_url,
            image: data.image_url,
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
          
          // Also fetch sections (from website_pages media)
          const { data: pagesData, error: pagesError } = await supabase
            .from('website_pages')
            .select('media, url')
            .eq('website_id', slug)
            .order('sort_order', { ascending: true });
            
          if (!pagesError && pagesData) {
            let allSections = [];
            pagesData.forEach(page => {
              if (page.media && Array.isArray(page.media)) {
                page.media.forEach((m, idx) => {
                  allSections.push({
                    id: m.url || `${page.url}-${idx}`,
                    section_type: m.title || 'Other',
                    section_title: m.title || 'Section',
                    image_url: m.url,
                    page_url: page.url
                  });
                });
              }
            });
            setSections(allSections);
          }
        }
        
        setWebsite(currentWebsite);
      } catch (err) {
        console.error('Error fetching website data:', err);
        navigate('/websites', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteData();
  }, [slug, navigate]);

  if (loading) return null;
  if (!website) return null;

  const displaySections = sections;

  const filteredSections = sectionFilter === 'All' ? displaySections : displaySections.filter(s => s.section_type === sectionFilter);

  return (
    <div className="website-detail-page">
      <div className="website-detail-content">
        <WebsiteOverview 
          website={website} 
          isSaved={!!(savedItems && savedItems[website.id])}
          toggleSave={toggleSave}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sectionFilter={sectionFilter}
          setSectionFilter={setSectionFilter}
          filteredSectionsCount={filteredSections.length}
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
              {filteredSections.length === 0 ? (
                <div className="empty-sections-state">
                  <p>No sections match the "{sectionFilter}" filter.</p>
                </div>
              ) : (
                <div className="card-grid">
                  {filteredSections.map((sec) => (
                    <SectionCard 
                      key={sec.id} 
                      id={sec.id}
                      section_type={sec.section_type}
                      section_title={sec.section_title}
                      image_url={sec.image_url}
                      page_url={sec.page_url}
                      parentWebsite={website}
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
    </div>
  );
}
