import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { CATEGORIES } from '../../../data/categories';

export default function TagsDropdown({ selectedTags, onChange, maxTags = 5 }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Flatten all tags for the dropdown
  const allTags = Object.values(CATEGORIES).flat();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (e, tag) => {
    e.stopPropagation();
    onChange(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="form-field-group tags-dropdown-container" ref={dropdownRef}>
      <label className="form-field-label">
        Tags* (select up to {maxTags})
      </label>
      
      <div 
        className={`tags-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="tags-dropdown-selected">
          {selectedTags.length > 0 ? (
            selectedTags.map(tag => (
              <span key={tag} className="tags-dropdown-pill">
                {tag}
                <button type="button" onClick={(e) => removeTag(e, tag)}><X size={12} /></button>
              </span>
            ))
          ) : (
            <span className="tags-dropdown-placeholder">Select tags</span>
          )}
        </div>
        <ChevronDown size={18} className="tags-dropdown-icon" />
      </div>

      {isOpen && (
        <div className="tags-dropdown-menu">
          {Object.entries(CATEGORIES).map(([group, tags]) => (
            <div key={group} className="tags-dropdown-group">
              <div className="tags-dropdown-group-label">{group}</div>
              {tags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                const isDisabled = !isSelected && selectedTags.length >= maxTags;
                return (
                  <div 
                    key={tag}
                    className={`tags-dropdown-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && toggleTag(tag)}
                  >
                    <span className="tags-dropdown-item-text">{tag}</span>
                    {isSelected && <Check size={16} className="tags-dropdown-check" />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
