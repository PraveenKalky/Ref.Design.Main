import React, { useState } from 'react';
import { ChevronUp, X } from 'lucide-react';
import './category-filter-expanded.css';

import { FILTER_TABS, CATEGORIES, CATEGORY_COUNTS } from '../../data/categories';

const CategoryFilterExpanded = ({ activeTab, tabs }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const currentTab = tabs ? tabs.find(t => t.id === activeTab) : null;
  const tabLabel = currentTab ? currentTab.label : (activeTab === 'popular' ? 'Popular Categories' : activeTab);
  const items = CATEGORIES[tabLabel] || CATEGORIES['Popular Categories'] || [];

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
        {items.map(cat => (
          <button
            key={cat}
            className={`cfe-tag ${selectedItems.includes(cat) ? 'selected' : ''}`}
            onClick={() => toggleItem(cat)}
          >
            {cat}
            {CATEGORY_COUNTS[cat] && <span className="cfe-tag-count">{CATEGORY_COUNTS[cat]}</span>}
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
