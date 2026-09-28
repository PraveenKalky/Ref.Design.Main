import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WebsiteMetadataPanel.css';

const DEFAULT_STYLES = [
  'Visible Border',
  'Card',
  'Light',
  'Text Heavy',
  'Minimal'
];

const DEFAULT_INDUSTRIES = [
  'Software as a Service',
  'Technology'
];

const DEFAULT_TYPES = [
  'Software'
];

const DEFAULT_FONTS = [
  'Geist',
  'Geist Mono',
  'Geist Pixel Square'
];

const DEFAULT_COLORS = [
  '#F8F8F8',
  '#111111',
  '#2D2BFF',
  '#D9D9D9'
];

export default function WebsiteMetadataPanel({ website }) {
  const navigate = useNavigate();

  // Robust extraction ensuring non-empty arrays fallback properly
  const rawStyles = (Array.isArray(website?.styles) && website.styles.length > 0)
    ? website.styles
    : (Array.isArray(website?.style) && website.style.length > 0)
      ? website.style
      : (typeof website?.style === 'string' && website.style.trim())
        ? [website.style.trim()]
        : null;
  const styleItems = (rawStyles && rawStyles.length > 0) ? rawStyles : DEFAULT_STYLES;

  const rawIndustries = (Array.isArray(website?.industries) && website.industries.length > 0)
    ? website.industries
    : (Array.isArray(website?.industry) && website.industry.length > 0)
      ? website.industry
      : (typeof website?.industry === 'string' && website.industry.trim())
        ? [website.industry.trim()]
        : null;
  const industryItems = (rawIndustries && rawIndustries.length > 0) ? rawIndustries : DEFAULT_INDUSTRIES;

  const rawTypes = (Array.isArray(website?.type) && website.type.length > 0)
    ? website.type
    : (typeof website?.type === 'string' && website.type.trim())
      ? [website.type.trim()]
      : (Array.isArray(website?.types) && website.types.length > 0)
        ? website.types
        : null;
  const typeItems = (rawTypes && rawTypes.length > 0) ? rawTypes : DEFAULT_TYPES;

  const rawFonts = (Array.isArray(website?.fonts) && website.fonts.length > 0)
    ? website.fonts
    : (Array.isArray(website?.fonts_in_use) && website.fonts_in_use.length > 0)
      ? website.fonts_in_use
      : (typeof website?.fonts === 'string' && website.fonts.trim())
        ? [website.fonts.trim()]
        : null;
  const fontItems = (rawFonts && rawFonts.length > 0) ? rawFonts : DEFAULT_FONTS;

  const rawColors = (Array.isArray(website?.colors) && website.colors.length > 0)
    ? website.colors
    : null;
  const colorItems = (rawColors && rawColors.length > 0) ? rawColors : DEFAULT_COLORS;

  const addedDate = website?.created_at 
    ? new Date(website.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : (website?.added || '08/09/2026');

  const handleNavigate = (term) => {
    navigate(`/search-results?q=${encodeURIComponent(term)}`);
  };

  return (
    <aside className="preview-metadata-panel" aria-label="Website Metadata">
      <div className="metadata-group">
        <h3 className="metadata-group-title">Style</h3>
        <ul className="metadata-list">
          {styleItems.map((item, idx) => (
            <li key={idx}>
              <button 
                type="button"
                className="metadata-item-btn"
                onClick={() => handleNavigate(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="metadata-group">
        <h3 className="metadata-group-title">Industry</h3>
        <ul className="metadata-list">
          {industryItems.map((item, idx) => (
            <li key={idx}>
              <button 
                type="button"
                className="metadata-item-btn"
                onClick={() => handleNavigate(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="metadata-group">
        <h3 className="metadata-group-title">Type</h3>
        <ul className="metadata-list">
          {typeItems.map((item, idx) => (
            <li key={idx}>
              <button 
                type="button"
                className="metadata-item-btn"
                onClick={() => handleNavigate(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="metadata-group">
        <h3 className="metadata-group-title">Fonts In Use</h3>
        <ul className="metadata-list">
          {fontItems.map((item, idx) => (
            <li key={idx}>
              <button 
                type="button"
                className="metadata-item-btn"
                onClick={() => handleNavigate(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="metadata-group">
        <h3 className="metadata-group-title">Colors</h3>
        <ul className="metadata-list">
          {colorItems.map((color, idx) => (
            <li key={idx}>
              <button 
                type="button"
                className="metadata-item-btn metadata-color-btn"
                onClick={() => handleNavigate(color)}
              >
                <span 
                  className="metadata-color-swatch" 
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="metadata-color-hex">{color.toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="metadata-group">
        <h3 className="metadata-group-title">Added</h3>
        <span className="metadata-item-static">{addedDate}</span>
      </div>
    </aside>
  );
}
