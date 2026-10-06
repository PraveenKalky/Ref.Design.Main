import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Building2, ChevronDown, Globe } from 'lucide-react';
import AssetLogo from '../../../components/asset-logo/AssetLogo';
import { 
  fetchAndStoreCanonicalLogo, 
  getCleanCompanyName, 
  isDisallowedLogoUrl,
  PRESET_COMPANIES
} from '../../../utils/logoPipeline';
import './CompanyCombobox.css';

const extractDomain = (urlStr) => {
  if (!urlStr) return '';
  try {
    let clean = urlStr.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch (e) {
    return '';
  }
};

const CompanyCombobox = ({ value, selectedCompany, onSelectCompany, onClearCompany, onChangeTitle, url }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLogoFor, setFetchingLogoFor] = useState(null);
  const wrapperRef = useRef(null);

  const currentDomain = extractDomain(url);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search existing companies in Supabase & Presets
  useEffect(() => {
    let isSubscribed = true;

    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const query = (value || '').trim().toLowerCase();
        
        let supabaseQuery = supabase
          .from('submissions')
          .select('id, title, url, normalised_url, logo_url, categories, description, styles')
          .order('created_at', { ascending: false })
          .limit(30);

        if (query) {
          supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,normalised_url.ilike.%${query}%`);
        }

        const { data, error } = await supabaseQuery;
        if (error) throw error;

        if (isSubscribed) {
          const companyMap = new Map();

          // 1. Add database submissions
          (data || []).forEach(item => {
            const domain = extractDomain(item.normalised_url || item.url);
            const key = domain || item.title.toLowerCase();
            const cleanTitle = getCleanCompanyName(domain, item.title);
            const cleanLogoUrl = isDisallowedLogoUrl(item.logo_url) ? '' : item.logo_url;

            if (!companyMap.has(key)) {
              companyMap.set(key, { 
                ...item, 
                domain, 
                title: cleanTitle, 
                logo_url: cleanLogoUrl,
                rawPageTitle: item.title,
                isPreset: false
              });
            } else {
              const existing = companyMap.get(key);
              if (!existing.logo_url && cleanLogoUrl) {
                existing.logo_url = cleanLogoUrl;
              }
            }
          });

          // 2. Merge matching PRESET_COMPANIES (Exchanges, Web3, DeFi, SaaS, AI, Dev Tools)
          (PRESET_COMPANIES || []).forEach(preset => {
            const key = preset.domain.toLowerCase();
            const matchesQuery = !query || 
              preset.title.toLowerCase().includes(query) || 
              preset.domain.toLowerCase().includes(query) || 
              (preset.category && preset.category.toLowerCase().includes(query));

            if (matchesQuery && !companyMap.has(key)) {
              companyMap.set(key, {
                id: `preset-${preset.domain}`,
                title: preset.title,
                url: preset.url,
                normalised_url: preset.domain,
                domain: preset.domain,
                logo_url: preset.logoUrl,
                categories: [preset.category],
                isPreset: true
              });
            }
          });

          let formattedList = Array.from(companyMap.values());

          if (currentDomain) {
            formattedList = formattedList.map(item => ({
              ...item,
              isDomainMatch: item.domain === currentDomain || (item.normalised_url && item.normalised_url.includes(currentDomain))
            }));
            formattedList.sort((a, b) => (b.isDomainMatch ? 1 : 0) - (a.isDomainMatch ? 1 : 0));
          }

          setResults(formattedList);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    const timer = setTimeout(fetchCompanies, 150);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [value, currentDomain]);

  const handleSelect = async (company) => {
    // If it's a preset, remove preset- prefix for new submission if needed
    const selectedObj = {
      ...company,
      id: company.isPreset ? null : company.id
    };

    onSelectCompany(selectedObj);
    setIsOpen(false);

    // If company lacks a canonical logo, fetch and store it permanently
    if (!selectedObj.logo_url && selectedObj.domain) {
      setFetchingLogoFor(selectedObj.domain);
      const newLogoUrl = await fetchAndStoreCanonicalLogo(selectedObj.domain);
      setFetchingLogoFor(null);
      if (newLogoUrl) {
        onSelectCompany({ ...selectedObj, logo_url: newLogoUrl });
      }
    }
  };

  const handleAddNew = () => {
    onClearCompany();
    setIsOpen(false);
  };

  if (selectedCompany) {
    return (
      <div className="company-combobox-wrapper">
        <label className="admin-label">Website / Company Group<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
        <div className="company-selected-card">
          <div className="company-selected-info">
            <AssetLogo
              name={selectedCompany.title}
              domain={selectedCompany.domain}
              logoUrl={selectedCompany.logo_url}
              size={28}
              rounded="md"
            />
            <div>
              <span className="company-selected-title">{selectedCompany.title}</span>
              {selectedCompany.domain && (
                <span className="company-selected-domain">({selectedCompany.domain})</span>
              )}
            </div>
          </div>
          <button type="button" className="company-change-btn" onClick={onClearCompany}>
            Change Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-combobox-wrapper" ref={wrapperRef}>
      <label className="admin-label">Website / Company Group<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          name="title"
          value={value || ''}
          onChange={(e) => {
            onChangeTitle(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="admin-input"
          placeholder="Search or add company (e.g. Stripe, Binance)"
          required
          autoComplete="off"
        />
        <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
      </div>

      {isOpen && (
        <div className="company-dropdown-menu">
          {results.length > 0 && (
            <div className="company-list">
              {results.map((comp) => (
                <div
                  key={comp.id || comp.domain}
                  className="company-dropdown-item"
                  onClick={() => handleSelect(comp)}
                >
                  <div className="company-item-left">
                    <AssetLogo
                      name={comp.title}
                      domain={comp.domain}
                      logoUrl={comp.logo_url}
                      size={32}
                      rounded="md"
                    />
                    <div className="company-item-details">
                      <span className="company-item-title">{comp.title}</span>
                      <span className="company-item-domain">{comp.domain || comp.normalised_url || comp.url}</span>
                    </div>
                  </div>
                  {comp.isDomainMatch && (
                    <span className="company-domain-badge">Domain Match</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {value && value.trim().length > 0 && (
            <div className="company-add-new-btn" onClick={handleAddNew}>
              <Plus size={16} />
              <span>Add "<strong>{value.trim()}</strong>" as a new company</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyCombobox;
