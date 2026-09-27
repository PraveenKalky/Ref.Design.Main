import React from 'react';
import AdminSectionBuilder from './AdminSectionBuilder';
import MediaUploader from './MediaUploader';
import PageMediaUploader from './PageMediaUploader';
import { Plus, Trash2 } from 'lucide-react';

const AdminPageBuilder = ({ page, updatePage, removePage, isLanding = false }) => {
  const handleChange = (e) => {
    updatePage({ ...page, [e.target.name]: e.target.value });
  };

  const addSection = () => {
    const newSection = { id: Date.now(), section_title: '', section_type: 'Custom', media: [] };
    updatePage({ ...page, sections: [...(page.sections || []), newSection] });
  };

  const updateSection = (index, updatedSection) => {
    const newSections = [...(page.sections || [])];
    newSections[index] = updatedSection;
    updatePage({ ...page, sections: newSections });
  };

  const removeSection = (index) => {
    const newSections = [...(page.sections || [])];
    newSections.splice(index, 1);
    updatePage({ ...page, sections: newSections });
  };


  return (
    <div style={{ borderRadius: '12px', cornerShape: 'squircle', WebkitCornerShape: 'squircle', padding: 0, marginBottom: '24px', backgroundColor: 'transparent' }}>
      {!isLanding && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dv-text)' }}>
              Inner Page
            </h3>
            <button type="button" onClick={removePage} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={16} /> Remove Page
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="admin-label">Page Title<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
              <input 
                type="text" 
                name="page_title" 
                value={page.page_title || ''} 
                onChange={handleChange} 
                className="admin-input" 
                placeholder="e.g. About Us"
                required
              />
            </div>
            <div>
              <label className="admin-label">Page URL (Slug)<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
              <input 
                type="text" 
                name="slug" 
                value={page.slug || ''} 
                onChange={handleChange} 
                className="admin-input" 
                placeholder="/about"
                required
              />
            </div>
          </div>
        </>
      )}

      <div style={{ marginBottom: '24px' }}>
        <label className="admin-label">Page Media (Screenshots, Videos)<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
        <PageMediaUploader 
          media={page.media || []} 
          onChange={(newMedia) => updatePage({ ...page, media: newMedia })} 
          folder="pages" 
        />
      </div>

    </div>
  );
};

export default AdminPageBuilder;
