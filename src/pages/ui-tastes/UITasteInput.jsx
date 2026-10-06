import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'lucide-react';
import { CaretUpDown, Check, UploadSimple } from '@phosphor-icons/react';
import UITasteUploadModal from './UITasteUploadModal';

export default function UITasteInput({ onAddPost, isFetching, onUploadSuccess }) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Landing Pages');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const [isRowDragOver, setIsRowDragOver] = useState(false);
  const categoryDropdownRef = useRef(null);

  const categories = [
    'Landing Pages', 'Hero', 'Testimonials', 'Pricing', 'Features',
    'CTA', 'Navigation', 'Footer', 'FAQ', 'Cards', 'Forms',
    'Dashboard', 'Tables', 'Charts', 'Authentication', 'Onboarding',
    'Mobile UI', 'Animation', 'Typography', 'Components',
    'Design Systems', 'E-commerce', 'Fintech', 'SaaS',
    'Portfolio', 'Other'
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

  // Drag & drop handlers for the submission bar
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsRowDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsRowDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsRowDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setDroppedFile(file);
        setIsUploadModalOpen(true);
      }
    }
  };

  return (
    <div 
      className={`ui-tastes-input-section ${isRowDragOver ? 'is-drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="ui-tastes-input-row">
        <form onSubmit={handleSubmit} className="ui-tastes-input-wrapper" id="ui-tastes-form">
          <Link size={20} color="#888888" />
          <input
            type="url"
            className="ui-tastes-url-input"
            placeholder={isRowDragOver ? 'Drop image here to upload...' : 'Paste post URL (Dribbble, X, Behance, etc.)'}
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

        {/* Companion Upload Image Button */}
        <button
          type="button"
          className="ui-tastes-upload-btn"
          onClick={() => {
            setDroppedFile(null);
            setIsUploadModalOpen(true);
          }}
          title="Upload Screenshot / Inspiration image"
        >
          <UploadSimple size={18} weight="bold" />
          <span className="ui-tastes-upload-btn-label">Upload Image</span>
        </button>
      </div>

      {/* Manual Upload Modal */}
      <UITasteUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setDroppedFile(null);
        }}
        initialFile={droppedFile}
        initialCategory={category}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
}
