import React, { useState } from 'react';
import { ChevronUp, X } from 'lucide-react';
import './category-filter-expanded.css';

const TABS = ['Popular Categories', 'Styles', 'Types', 'Subjects', 'Platforms'];

const CATEGORIES = [
  'Agencies & Consultancies', 'Typographic', 'Design & Art Direction',
  'Portfolio', 'Web & Interactive Design', 'E-Commerce', 'Fashion',
  'Minimal', 'Grid Layout', 'Unusual Layout', 'Art', 'Use of Animation'
];

const CategoryFilterExpanded = () => {
  const [selectedItems, setSelectedItems] = useState(['Agencies & Consultancies', 'Minimal', 'Portfolio']);

  const toggleItem = (item) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const removeChip = (item) => {
    const el = document.getElementById(`chip-${item}`);
    if (el) {
      el.classList.add('chip-exit');
      setTimeout(() => {
        setSelectedItems(prev => prev.filter(i => i !== item));
      }, 200);
    } else {
      toggleItem(item);
    }
  };

  return (
    <div className="category-filter-expanded">
      {/* Row 2: Category Tags */}
      <div className="cfe-tags-grid">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cfe-tag ${selectedItems.includes(cat) ? 'selected' : ''}`}
            onClick={() => toggleItem(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Row 3: Active Selection Chips */}
      {selectedItems.length > 0 && (
        <div className="cfe-chips-container">
          {selectedItems.map(item => (
            <div key={item} id={`chip-${item}`} className="cfe-chip selected-chip">
              <span>{item}</span>
              <button
                className="cfe-chip-remove"
                onClick={() => removeChip(item)}
                aria-label={`Remove ${item}`}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilterExpanded;
