import React from 'react';
import MediaUploader from './MediaUploader';
import { Trash2 } from 'lucide-react';

const AdminSectionBuilder = ({ section, updateSection, removeSection }) => {
  const handleChange = (e) => {
    updateSection({ ...section, [e.target.name]: e.target.value });
  };

  const handleMediaUpload = (url) => {
    updateSection({ ...section, media: [...(section.media || []), url] });
  };

  const removeMedia = (index) => {
    const newMedia = [...(section.media || [])];
    newMedia.splice(index, 1);
    updateSection({ ...section, media: newMedia });
  };

  return (
    <div className="admin-section-builder" style={{ border: '1px dashed var(--dv-border)', padding: '16px', margin: '8px 0', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, color: 'var(--dv-text)' }}>Section</h4>
        <button type="button" onClick={removeSection} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
          <Trash2 size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <input 
          type="text" 
          name="section_title" 
          value={section.section_title || ''} 
          onChange={handleChange} 
          placeholder="Section Title (e.g. Hero)" 
          className="admin-input" 
          required
        />
        <select 
          name="section_type" 
          value={section.section_type || 'Custom'} 
          onChange={handleChange}
          className="admin-input"
        >
          <option value="Hero">Hero</option>
          <option value="Features">Features</option>
          <option value="Pricing">Pricing</option>
          <option value="Testimonials">Testimonials</option>
          <option value="Footer">Footer</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Section Media</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {(section.media || []).map((url, i) => (
            <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
              <img src={url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
              <button 
                type="button" 
                onClick={() => removeMedia(i)} 
                style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, border: 'none', cursor: 'pointer', fontSize: 12 }}
              >×</button>
            </div>
          ))}
        </div>
        <MediaUploader multiple onUpload={(urls) => {
          const newUrls = Array.isArray(urls) ? urls : [urls];
          updateSection({ ...section, media: [...(section.media || []), ...newUrls] });
        }} folder="sections" />
      </div>
    </div>
  );
};

export default AdminSectionBuilder;
