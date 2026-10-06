import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminWebsiteForm from './components/AdminWebsiteForm';
import AdminPageBuilder from './components/AdminPageBuilder';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fetchAndStoreCanonicalLogo } from '../../utils/logoPipeline';
import { Plus, Save, Send, ArrowLeft, Check, Copy, X } from 'lucide-react';
import '../../components/navbar/login-modal.css';
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
  const { id: editingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingEditData, setFetchingEditData] = useState(!!editingId);
  const [toasts, setToasts] = useState([]);
  const [copiedToastId, setCopiedToastId] = useState(null);

  const showToast = (type, text) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message: text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const [website, setWebsite] = useState({
    title: '',
    url: '',
    description: '',
    categories: '',
    styles: '',
    thumbnail_url: '',
    fullpage_image_url: '',
    use_separate_media: false,
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

  // Preload existing website data when editingId is present
  useEffect(() => {
    if (!editingId) return;

    const fetchExistingData = async () => {
      try {
        setFetchingEditData(true);

        // 1. Fetch submission
        const { data: sub, error: subError } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', editingId)
          .single();

        if (subError) throw subError;
        if (!sub) throw new Error('Website submission not found');

        setWebsite({
          title: sub.title || '',
          url: sub.url || '',
          description: sub.description || '',
          categories: Array.isArray(sub.categories) ? sub.categories.join(', ') : (sub.categories || ''),
          styles: Array.isArray(sub.styles) ? sub.styles.join(', ') : (sub.styles || ''),
          thumbnail_url: sub.image_url || sub.thumbnail_url || '',
          fullpage_image_url: sub.fullpage_image_url || '',
          use_separate_media: sub.use_separate_media || false,
          logo_url: sub.logo_url || ''
        });

        // 2. Fetch pages & sections
        const { data: pagesData, error: pagesError } = await supabase
          .from('website_pages')
          .select('*')
          .eq('website_id', editingId)
          .order('sort_order', { ascending: true });

        if (pagesError) throw pagesError;

        const { data: sectionsData, error: sectionsError } = await supabase
          .from('website_sections')
          .select('*')
          .eq('website_id', editingId)
          .order('sort_order', { ascending: true });

        if (sectionsError) throw sectionsError;

        if (pagesData && pagesData.length > 0) {
          const loadedPages = pagesData.map(p => {
            const pageSections = (sectionsData || []).filter(sec => sec.page_id === p.id).map(sec => ({
              id: sec.id,
              section_title: sec.section_title || '',
              section_type: sec.section_type || 'Custom',
              media: sec.media && sec.media.length > 0 ? sec.media : (sec.image_url ? [sec.image_url] : [])
            }));

            return {
              id: p.id,
              page_title: p.page_title || '',
              slug: p.slug || p.path || '/',
              page_type: p.page_type || 'inner',
              media: p.media || [],
              sections: pageSections
            };
          });

          setPages(loadedPages);
        }
      } catch (err) {
        console.error('Error preloading website data:', err);
        showToast('error', `Failed to load website data: ${err.message}`);
      } finally {
        setFetchingEditData(false);
      }
    };

    fetchExistingData();
  }, [editingId]);

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
      // Cleared messages

      const normalisedUrl = website.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      let finalLogoUrl = website.logo_url;
      if (!finalLogoUrl && normalisedUrl) {
        const fetchedLogo = await fetchAndStoreCanonicalLogo(normalisedUrl);
        if (fetchedLogo) finalLogoUrl = fetchedLogo;
      }

      let websiteId = editingId || (website.selectedCompany ? website.selectedCompany.id : null);

      if (editingId || website.selectedCompany) {
        // Update existing company / submission record
        const targetId = websiteId;
        const { error: updateError } = await supabase
          .from('submissions')
          .update({
            title: website.title,
            url: website.url,
            normalised_url: normalisedUrl,
            description: website.description,
            categories: parseCommaList(website.categories),
            styles: parseCommaList(website.styles),
            image_url: website.thumbnail_url,
            thumbnail_url: website.thumbnail_url,
            fullpage_image_url: website.fullpage_image_url || website.thumbnail_url,
            use_separate_media: website.use_separate_media || false,
            logo_url: finalLogoUrl,
            status: status
          })
          .eq('id', targetId);

        if (updateError) throw updateError;
        websiteId = targetId;

        // If editing whole website, clean up previous pages/sections to replace with updated state
        if (editingId) {
          await supabase.from('website_sections').delete().eq('website_id', editingId);
          await supabase.from('website_pages').delete().eq('website_id', editingId);
        }
      } else {
        // Insert brand new company record
        const { data: subData, error: subError } = await supabase.from('submissions').insert([{
          title: website.title,
          url: website.url,
          normalised_url: normalisedUrl,
          description: website.description,
          categories: parseCommaList(website.categories),
          styles: parseCommaList(website.styles),
          image_url: website.thumbnail_url,
          thumbnail_url: website.thumbnail_url,
          fullpage_image_url: website.fullpage_image_url || website.thumbnail_url,
          use_separate_media: website.use_separate_media || false,
          logo_url: finalLogoUrl,
          status: status,
          submitted_by: user?.id || null
        }]).select().single();

        if (subError) throw subError;
        if (!subData || !subData.id) {
          throw new Error('Could not retrieve created submission ID.');
        }
        websiteId = subData.id;
      }

      // 2. Insert Pages and Sections
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Safely construct the full URL and path
        const rawSlug = page.slug || (page.page_type === 'landing' ? '/' : `/${(page.page_title || 'page').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
        const formattedSlug = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`;
        const baseUrl = website.url.replace(/\/$/, ''); // strip trailing slash from base
        const pageUrl = baseUrl + (formattedSlug !== '/' ? formattedSlug : '');
        
        // Generate normalized_url using the project's existing logic
        const pageNormalizedUrl = pageUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

        // Derive non-null route path
        const pagePath = formattedSlug || '/';

        const { data: pageData, error: pageError } = await supabase.from('website_pages').insert([{
          website_id: websiteId,
          page_title: page.page_title || (page.page_type === 'landing' ? 'Home' : 'Page'),
          slug: formattedSlug,
          path: pagePath,
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

      const successMsg = editingId 
        ? `Website "${website.title}" updated successfully!` 
        : `Website ${status === 'Pending' ? 'draft saved' : 'published'} successfully!`;

      showToast('success', successMsg);
      
      // Reset form if published and creating new
      if (status === 'Approved' && !editingId) {
        setWebsite({ title: '', url: '', description: '', categories: '', styles: '', thumbnail_url: '', logo_url: '' });
        setPages([{ id: Date.now(), page_title: 'Home', slug: '/', page_type: 'landing', media: [], sections: [] }]);
      }
      
    } catch (error) {
      console.error('Error saving website:', error);
      showToast('error', error.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEditData) {
    return (
      <div className="admin-container" style={{ maxWidth: '900px', margin: '80px auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--dv-text)', fontSize: '18px' }}>Loading website details for editing...</p>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/websites" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#666', textDecoration: 'none', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to Websites
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', margin: 0, color: 'var(--dv-text)' }}>
          {editingId ? `Edit Website: ${website.title || 'Submission'}` : 'Create New Website Submission'}
        </h1>
      </div>

      

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

      <div style={{ display: 'flex', gap: '12px', marginTop: '32px', width: '100%' }}>
        <button 
          onClick={() => handleSave('Pending')} 
          disabled={loading}
          className="admin-btn admin-btn-secondary"
          style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', gap: '8px', height: '48.5px' }}
        >
          <div className="btn-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> <AnimatedText text="Save Draft" />
          </div>
        </button>
        <button 
          onClick={() => handleSave('Approved')} 
          disabled={loading}
          className="admin-btn admin-btn-primary"
          style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', gap: '8px', height: '48.5px' }}
        >
          <div className="btn-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} /> <AnimatedText text={editingId ? "Update Website" : "Publish"} />
          </div>
        </button>
      </div>

      {toasts.length > 0 && (
        <div className="lm-toast-container">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className="lm-toast"
              style={{
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div className={`lm-toast-icon lm-toast-${toast.type}`}>
                {toast.type === 'success' ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
              </div>
              <span className="lm-toast-msg">{toast.message}</span>
              {toast.type === 'error' && (
                <button
                  type="button"
                  className="lm-toast-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(toast.message);
                    setCopiedToastId(toast.id);
                    setTimeout(() => setCopiedToastId(null), 2000);
                  }}
                  title="Copy complete error message"
                >
                  {copiedToastId === toast.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedToastId === toast.id && <span className="lm-toast-copied-text">Copied</span>}
                </button>
              )}
              <button
                type="button"
                className="lm-toast-close"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AddWebsite;
