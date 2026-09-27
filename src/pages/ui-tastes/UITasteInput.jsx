import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'lucide-react';
import { CaretUpDown, Check } from '@phosphor-icons/react';

export default function UITasteInput({ onAddPost, isFetching }) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Landing Pages');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  const categories = [
    'Landing Pages', 'Dashboard', 'Mobile App', 'Forms',
    'Authentication', 'E-commerce', 'Fintech', 'SaaS',
    'Portfolio', 'Animation', 'Motion', 'Navigation',
    'Components', 'Typography', 'AI', 'Design Systems',
    'Design Inspiration', 'Icons', 'Illustrations', '3D',
    'Branding', 'Marketing', 'Onboarding', 'Empty States',
    'Data Visualization', 'Charts', 'Tables', 'Micro Interactions',
    'Accessibility', 'Miscellaneous'
  ];

  // Outside-click to close — same pattern as Fonts.jsx
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAddPost(url, category);
    setUrl('');
  };

  return (
    <div className="ui-tastes-input-section">
      <div className="ui-tastes-input-row">
        <form onSubmit={handleSubmit} className="ui-tastes-input-wrapper" id="ui-tastes-form">
          <Link size={20} color="#888888" />
          <input
            type="url"
            className="ui-tastes-url-input"
            placeholder="Paste post URL (Dribbble, X, Behance, etc.)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />

          {/* Custom category dropdown — same pattern as Fonts sort */}
          <div className="ui-tastes-sort-container" ref={categoryDropdownRef}>
            <button
              type="button"
              className="ui-tastes-category-trigger"
              onClick={(e) => { e.stopPropagation(); setIsCategoryOpen(!isCategoryOpen); }}
              onKeyDown={(e) => { if (e.key === 'Escape') setIsCategoryOpen(false); }}
              aria-haspopup="listbox"
              aria-expanded={isCategoryOpen}
            >
              <span>{category}</span>
              <CaretUpDown size={14} weight="bold" />
            </button>

            <div
              className={`ui-tastes-category-menu sort-dropdown ${isCategoryOpen ? 'open' : ''}`}
              role="listbox"
            >
              {categories.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={category === opt}
                  className={`sort-option ${category === opt ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategory(opt);
                    setIsCategoryOpen(false);
                  }}
                >
                  {opt}
                  {category === opt && <Check size={14} weight="bold" style={{ marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
          </div>
        </form>

        <button
          type="submit"
          form="ui-tastes-form"
          className="ui-tastes-add-btn"
          disabled={isFetching || !url.trim()}
          onClick={handleSubmit}
        >
          {isFetching ? (
            <span className="fetching-dot-wave">
              Fetching
              <span className="dot wave-dot"></span>
              <span className="dot wave-dot"></span>
              <span className="dot wave-dot"></span>
              <span className="dot wave-dot"></span>
            </span>
          ) : '+ Add Post'}
        </button>
      </div>
    </div>
  );
}
