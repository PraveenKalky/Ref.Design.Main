import React, { useState } from 'react';
import AdminWebsiteForm from './components/AdminWebsiteForm';
import AdminPageBuilder from './components/AdminPageBuilder';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Plus, Save, Send } from 'lucide-react';
import './admin.css';

const AnimatedText = ({ text }) => {
  return (
    <span className="animated-text">
      {[...text].map((c, i) => (
        <span key={i} className="char" style={{ '--i': i }}>
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </span>
  );
};

const AddWebsite = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [website, setWebsite] = useState({
    title: '',
    url: '',
    description: '',
    categories: '',
    styles: '',
    thumbnail_url: '',
    logo_url: ''
  });

  const [pages, setPages] = useState([
    {
      id: Date.now(),
      page_title: 'Home',
      slug: '/',
      page_type: 'landing',
      media: [],
      sections: []
    }
  ]);

  const addInnerPage = () => {
    setPages([...pages, {
      id: Date.now(),
      page_title: '',
      slug: '',
      page_type: 'inner',
      media: [],
      sections: []
    }]);
  };

  const updatePage = (index, updatedPage) => {
    const newPages = [...pages];
    newPages[index] = updatedPage;
    setPages(newPages);
  };

  const removePage = (index) => {
    const newPages = [...pages];
    newPages.splice(index, 1);
    setPages(newPages);
  };

  const parseCommaList = (str) => {
    return str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
  };

  const handleSave = async (status = 'Approved') => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const normalisedUrl = website.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

      // 1. Insert Website (submissions table)
      const { data: subData, error: subError } = await supabase.from('submissions').insert([{
        title: website.title,
        url: website.url,
        normalised_url: normalisedUrl,
        description: website.description,
        categories: parseCommaList(website.categories),
        styles: parseCommaList(website.styles),
        image_url: website.thumbnail_url,
        logo_url: website.logo_url,
        status: status,
        submitted_by: user.id
      }]).select().single();

      if (subError) throw subError;
      const websiteId = subData.id;

      // 2. Insert Pages and Sections
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Safely construct the full URL
        const rawSlug = page.slug || (page.page_type === 'landing' ? '/' : `/${page.page_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
        const baseUrl = website.url.replace(/\/$/, ''); // strip trailing slash from base
        const pageUrl = baseUrl + (rawSlug !== '/' ? rawSlug : '');
        
        // Generate normalized_url using the project's existing logic
        const pageNormalizedUrl = pageUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

        const { data: pageData, error: pageError } = await supabase.from('website_pages').insert([{
          website_id: websiteId,
          page_title: page.page_title,
          slug: rawSlug,
          page_type: page.page_type,
          sort_order: i,
          url: pageUrl,
          normalized_url: pageNormalizedUrl || "fallback-url",
          media: page.media || []
        }]).select().single();

        if (pageError) throw pageError;
        const pageId = pageData.id;

        if (page.sections && page.sections.length > 0) {
          const sectionsToInsert = page.sections.map((sec, secIdx) => ({
            website_id: websiteId,
            page_id: pageId,
            section_title: sec.section_title,
            section_type: sec.section_type,
            sort_order: secIdx,
            page_url: pageData.url,
            image_url: sec.media && sec.media.length > 0 ? sec.media[0] : '', // keep backward compatibility
            media: sec.media || [],
            status: status
          }));

          const { error: secError } = await supabase.from('website_sections').insert(sectionsToInsert);
          if (secError) throw secError;
        }
      }

      setMessage({ type: 'success', text: `Website ${status === 'Pending' ? 'draft saved' : 'published'} successfully!` });
      
      // Reset form if published
      if (status === 'Approved') {
        setWebsite({ title: '', url: '', description: '', categories: '', styles: '', thumbnail_url: '', logo_url: '' });
        setPages([{ id: Date.now(), page_title: 'Home', slug: '/', page_type: 'landing', media: [], sections: [] }]);
      }
      
    } catch (error) {
      console.error('Error saving website:', error);
      setMessage({ type: 'error', text: error.message || 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', margin: 0, color: 'var(--dv-text)' }}>Create New Website Submission</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => handleSave('Pending')} 
            disabled={loading}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div className="btn-content">
              <Save size={16} /> <AnimatedText text="Save Draft" />
            </div>
          </button>
          <button 
            onClick={() => handleSave('Approved')} 
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div className="btn-content">
              <Send size={16} /> <AnimatedText text="Publish" />
            </div>
          </button>
        </div>
      </div>

      {message.text && (
        <div style={{ padding: '16px', marginBottom: '24px', borderRadius: '8px', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#991b1b' : '#166534' }}>
          {message.text}
        </div>
      )}

      <AdminWebsiteForm website={website} updateWebsite={setWebsite} />

      <h3 style={{ marginBottom: '20px', color: 'var(--dv-text)' }}>2. Pages & Sections Structure</h3>
      
      {pages.map((page, idx) => (
        <AdminPageBuilder 
          key={page.id} 
          page={page} 
          updatePage={(p) => updatePage(idx, p)} 
          removePage={() => removePage(idx)}
          isLanding={page.page_type === 'landing'}
        />
      ))}

    </div>
  );
};

export default AddWebsite;
