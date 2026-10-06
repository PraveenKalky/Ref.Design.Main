import React, { useState, useEffect, useRef } from 'react';
import MediaUploader from './MediaUploader';
import PrimaryThumbnailUploader from './PrimaryThumbnailUploader';
import LogoUploader from './LogoUploader';
import CompanyCombobox from './CompanyCombobox';
import { Trash2, RefreshCw, Sun, Moon, Monitor, Smartphone, Tablet, Maximize, X, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { CATEGORIES } from '../../../data/categories';

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

const DEFAULT_CATEGORY_OPTIONS = [
  'Agencies & Consultancies',
  'Typographic',
  'Design & Art Direction',
  'Portfolio',
  'Web & Interactive Design',
  'E-Commerce',
  'Fashion',
  'Trading',
  'Landing Page',
  'Web App',
  'Blog',
  'Corporate',
  'Directory',
  'Documentation'
];

const DrawdownInput = ({ name, value, onChange, placeholder, options = [], required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const combinedOptions = Array.from(new Set([...DEFAULT_CATEGORY_OPTIONS, ...options]));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentValues = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleToggle = (option) => {
    let newValues;
    if (currentValues.includes(option)) {
      newValues = currentValues.filter(v => v !== option);
    } else {
      newValues = [...currentValues, option];
    }
    onChange({ target: { name, value: newValues.join(', ') } });
  };

  const handleAddTyped = (textToAdd) => {
    const trimmed = textToAdd.trim();
    if (trimmed && !currentValues.includes(trimmed)) {
      const newValues = [...currentValues, trimmed];
      onChange({ target: { name, value: newValues.join(', ') } });
    }
    setTypedText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTyped(typedText);
    } else if (e.key === 'Backspace' && typedText === '' && currentValues.length > 0) {
      const newValues = currentValues.slice(0, -1);
      onChange({ target: { name, value: newValues.join(', ') } });
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {/* Main Field with Selected Pills */}
      <div 
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        style={{ 
          width: '100%',
          minHeight: '48px',
          backgroundColor: 'var(--dv-surface-dark)',
          border: '1px solid transparent',
          borderRadius: '12px',
          cornerShape: 'squircle',
          WebkitCornerShape: 'squircle',
          padding: '8px 12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          cursor: 'text',
          transition: 'all 0.2s ease'
        }}
      >
        {currentValues.map((val, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: 'var(--dv-text)',
              color: 'var(--dv-bg)',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: 1
            }}
          >
            {val}
            <X
              size={13}
              style={{ cursor: 'pointer', opacity: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(val);
              }}
            />
          </span>
        ))}

        <input 
          ref={inputRef}
          type="text" 
          name={`${name}_input`}
          value={typedText} 
          onChange={(e) => setTypedText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={currentValues.length === 0 ? placeholder : ''} 
          autoComplete="off"
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--dv-text)',
            fontFamily: 'inherit',
            fontSize: '15px',
            flex: 1,
            minWidth: '100px',
            padding: '4px 0'
          }}
        />

        {/* Hidden input for form validation */}
        {required && (
          <input 
            type="text" 
            name={name} 
            value={value} 
            onChange={() => {}}
            required={required}
            style={{ opacity: 0, width: 0, height: 0, padding: 0, border: 'none', position: 'absolute', pointerEvents: 'none' }}
          />
        )}
      </div>

      {/* Filled Dropdown Box — 10 List Rows Layout */}
      {isOpen && (
        <div 
          style={{ 
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 100,
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'var(--dv-surface-dark)', 
            border: 'none', 
            borderRadius: '16px', 
            cornerShape: 'squircle',
            WebkitCornerShape: 'squircle',
            boxShadow: 'none',
            maxHeight: '260px', 
            overflowY: 'auto',
            padding: '4px 0'
          }}
        >
          {combinedOptions.map((opt, i) => {
            const isSelected = currentValues.includes(opt);
            const isLast = i === combinedOptions.length - 1;
            return (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(opt);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: isLast ? 'none' : '1px solid var(--dv-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--dv-text)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dv-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{opt}</span>
                {isSelected && (
                  <Check size={16} style={{ color: 'var(--dv-text)', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AdminWebsiteForm = ({ website, updateWebsite }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  // Ref to track if the URL change came from selecting a suggestion, 
  // so we don't re-trigger suggestion fetches
  const justSelectedSuggestion = useRef(false);

  // Debounced URL fetch
  useEffect(() => {
    const url = website.url?.trim();
    if (!url || !url.match(/^https?:\/\//)) {
      setFetchError('');
      return;
    }

    const timer = setTimeout(async () => {
      // Don't auto-fetch if we already have a description and we're not explicitly refreshing
      // Wait, we want to auto-fetch the FIRST time they paste a URL if fields are empty
      if (website.description && website.logo_url) return;

      await fetchMetadata(url);
    }, 1000);

    return () => clearTimeout(timer);
  }, [website.url]);

  // Debounced Name fetch (Clearbit)
  useEffect(() => {
    const title = website.title?.trim();
    if (!title || title.length < 2 || website.url) {
      setSuggestions([]);
      return;
    }

    if (justSelectedSuggestion.current) {
      justSelectedSuggestion.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(title)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Clearbit fetch error:', err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [website.title, website.url]);

  const fetchMetadata = async (urlToFetch, forceOverwrite = false) => {
    setIsFetching(true);
    setFetchError('');
    try {
      // Use Microlink API which is a reliable, free, CORS-enabled metadata extractor 
      // (avoids Docker/Supabase edge function requirements)
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(urlToFetch)}`);
      
      if (!res.ok) throw new Error('Failed to fetch metadata');
      const json = await res.json();
      
      if (json.status !== 'success' || !json.data) {
        throw new Error('Failed to parse metadata');
      }

      const { title, description, image, logo } = json.data;
      const cleanLogoCandidate = logo?.url && !logo.url.includes('opengraph') && !logo.url.includes('social') ? logo.url : '';

      // Auto-fill. If forceOverwrite, ignore current fields.
      updateWebsite({
        ...website,
        url: urlToFetch,
        title: (forceOverwrite ? '' : website.title) || title || '',
        description: (forceOverwrite ? '' : website.description) || description || '',
        logo_url: (forceOverwrite ? '' : website.logo_url) || cleanLogoCandidate,
        thumbnail_url: (forceOverwrite ? '' : website.thumbnail_url) || (image?.url || '')
      });
    } catch (err) {
      console.error('Metadata fetch error:', err);
      setFetchError(err.message || 'Failed to fetch metadata');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSuggestionClick = (sugg) => {
    justSelectedSuggestion.current = true;
    const newUrl = `https://${sugg.domain}`;
    setSuggestions([]);
    
    // Set title and URL. The URL change will automatically trigger the useEffect 
    // to fetch the metadata using the fresh state closure.
    updateWebsite({
      ...website,
      title: sugg.name,
      url: newUrl,
      logo_url: website.logo_url || sugg.logo || ''
    });
  };

  const forceRefresh = () => {
    if (website.url) {
      fetchMetadata(website.url, true);
    }
  };

  const handleChange = (e) => {
    updateWebsite({ ...website, [e.target.name]: e.target.value });
  };

  const handleThumbnailUpload = (url) => {
    updateWebsite({ ...website, thumbnail_url: url });
  };

  return (
    <div style={{ borderRadius: '12px', padding: 0, marginBottom: '32px', backgroundColor: 'transparent' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: 'var(--dv-text)' }}>1. Website Details</h3>
        {website.url && (
          <button 
            type="button" 
            onClick={forceRefresh}
            disabled={isFetching}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'none', border: 'none', color: 'var(--dv-text-ghost)', cursor: 'pointer' }}
          >
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
            {isFetching ? 'Fetching metadata...' : 'Refresh metadata'}
          </button>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <CompanyCombobox
            value={website.title}
            selectedCompany={website.selectedCompany}
            onSelectCompany={(comp) => {
              updateWebsite({
                ...website,
                selectedCompany: comp,
                title: comp.title,
                url: comp.url || website.url,
                description: comp.description || website.description,
                categories: Array.isArray(comp.categories) ? comp.categories.join(', ') : (comp.categories || website.categories),
                styles: Array.isArray(comp.styles) ? comp.styles.join(', ') : (comp.styles || website.styles),
                logo_url: comp.logo_url || website.logo_url,
                thumbnail_url: comp.image_url || comp.thumbnail_url || website.thumbnail_url
              });
            }}
            onClearCompany={() => {
              updateWebsite({
                ...website,
                selectedCompany: null
              });
            }}
            onChangeTitle={(newTitle) => {
              updateWebsite({
                ...website,
                title: newTitle,
                selectedCompany: null
              });
            }}
            url={website.url}
          />
        </div>
        <div>
          <label className="admin-label">URL<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
          <input type="url" name="url" value={website.url || ''} onChange={handleChange} className="admin-input" placeholder="https://stripe.com" required />
          {fetchError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{fetchError}</div>}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className="admin-label">Description<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
        <textarea name="description" value={website.description || ''} onChange={handleChange} className="admin-input" rows="3" placeholder="Brief description..." required></textarea>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
        <div>
          <label className="admin-label">Categories (comma separated)<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
          <DrawdownInput 
            name="categories" 
            value={website.categories || ''} 
            onChange={handleChange} 
            placeholder="e.g. SaaS, Fintech" 
            options={[...new Set([...CATEGORIES['Categories'], ...CATEGORIES['Types'], ...CATEGORIES['Subjects']])]}
            required={true}
          />
        </div>
        <div>
          <label className="admin-label">Tags/Styles (comma separated)<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
          <DrawdownInput 
            name="styles" 
            value={website.styles || ''} 
            onChange={handleChange} 
            placeholder="e.g. Minimal, Dark Mode" 
            options={[...new Set([...CATEGORIES['Styles'], ...CATEGORIES['Tags'], ...CATEGORIES['Colors']])]}
            required={true}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label className="admin-label">Theme<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Light', 'Dark'].map(theme => {
              const isSelected = (website.themes || []).includes(theme);
              return (
                <button
                  key={theme}
                  type="button"
                  className="shuffle-hover"
                  onClick={() => {
                    const current = website.themes || [];
                    updateWebsite({ 
                      ...website, 
                      themes: isSelected ? current.filter(t => t !== theme) : [...current, theme] 
                    });
                  }}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '100px',
                    border: `1px solid ${isSelected ? 'var(--dv-text)' : 'var(--dv-border)'}`,
                    backgroundColor: isSelected ? 'var(--dv-text)' : 'transparent',
                    color: isSelected ? 'var(--dv-bg)' : 'var(--dv-text)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {theme === 'Light' && <Sun size={16} />}
                  {theme === 'Dark' && <Moon size={16} />}
                  <AnimatedText text={theme} />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="admin-label">Platform<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Desktop', 'Mobile'].map(platform => {
              const isSelected = (website.platforms || []).includes(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  className="shuffle-hover"
                  onClick={() => {
                    const current = website.platforms || [];
                    updateWebsite({ 
                      ...website, 
                      platforms: isSelected ? current.filter(p => p !== platform) : [...current, platform] 
                    });
                  }}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '100px',
                    border: `1px solid ${isSelected ? 'var(--dv-text)' : 'var(--dv-border)'}`,
                    backgroundColor: isSelected ? 'var(--dv-text)' : 'transparent',
                    color: isSelected ? 'var(--dv-bg)' : 'var(--dv-text)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {platform === 'Desktop' && <Monitor size={16} />}
                  {platform === 'Mobile' && <Smartphone size={16} />}
                  <AnimatedText text={platform} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label className="admin-label">Responsive / Web Presets<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Default — 1512px', 'Desktop — 1024px', 'Tablet — 720px', 'Mobile — 320px'].map(preset => {
            const isSelected = (website.presets || []).includes(preset);
            return (
              <button
                key={preset}
                type="button"
                className="shuffle-hover"
                onClick={() => {
                  const current = website.presets || [];
                  updateWebsite({ 
                    ...website, 
                    presets: isSelected ? current.filter(p => p !== preset) : [...current, preset] 
                  });
                }}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '100px',
                  border: `1px solid ${isSelected ? 'var(--dv-text)' : 'var(--dv-border)'}`,
                  backgroundColor: isSelected ? 'var(--dv-text)' : 'transparent',
                  color: isSelected ? 'var(--dv-bg)' : 'var(--dv-text)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {preset.includes('Default') && <Maximize size={16} />}
                {preset.includes('Desktop') && <Monitor size={16} />}
                {preset.includes('Tablet') && <Tablet size={16} />}
                {preset.includes('Mobile') && <Smartphone size={16} />}
                <AnimatedText text={preset} />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label className="admin-label">Website Logo<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
        <LogoUploader 
          value={website.logo_url} 
          onChange={(url) => updateWebsite({ ...website, logo_url: url })} 
        />
      </div>

      <div>
        <PrimaryThumbnailUploader 
          value={website.thumbnail_url} 
          fullpageValue={website.fullpage_image_url}
          useSeparateMedia={website.use_separate_media}
          onChange={(url) => updateWebsite({ ...website, thumbnail_url: url, image_url: url })} 
          onFullpageChange={(url) => updateWebsite({ ...website, fullpage_image_url: url })}
          onToggleChange={(val) => updateWebsite({ ...website, use_separate_media: val })}
        />
      </div>
    </div>
  );
};

export default AdminWebsiteForm;
