import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  CaretDown, 
  MagnifyingGlass, 
  X as XPhosphor,
  PlayCircle,
  Image as ImageIcon,
  Check,
  Globe
} from '@phosphor-icons/react';
import './UITasteFilterBar.css';

// Inline SVG brand icons
const IconAll = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconDribbble = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.952-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.017-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.logout c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.176zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.477 0-.945.04-1.4.113v.175zm4.815 7.38c.21-.06.42-.12.63-.174-1.74-3.105-3.62-5.696-3.886-6.067-1.897.386-3.58 1.31-4.9 2.612C7.586 6.29 9.383 8.72 10.82 10.785c1.19-.398 2.46-.74 3.596-.953z"/>
  </svg>
);

const IconBehance = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-.16 1.35-.49.35-1.05.6-1.69.75-.63.148-1.29.225-1.98.225H0V4.51h6.938v-.007zM6.955 9.66c.59 0 1.08-.14 1.447-.42.37-.28.55-.72.55-1.33 0-.33-.057-.61-.174-.84-.116-.23-.28-.42-.49-.57-.21-.14-.45-.24-.724-.3-.27-.06-.57-.09-.89-.09H3.62V9.66h3.336v.002zm.16 5.49c.35 0 .67-.03.97-.1.3-.07.56-.18.79-.34.23-.16.41-.37.54-.63.13-.27.2-.59.2-.97 0-.76-.22-1.31-.67-1.66-.45-.34-1.05-.51-1.81-.51H3.62v4.21h3.495zm8.16-5.19c.5-.48 1.19-.72 2.07-.72.6 0 1.12.14 1.54.42.42.28.76.6 1 .98.24.38.41.79.49 1.24.08.45.12.87.12 1.28v.75H13.5c.05.8.27 1.35.67 1.67.4.32.9.48 1.52.48.48 0 .9-.1 1.26-.31.36-.21.6-.43.72-.66h2.71c-.43 1.08-1.09 1.85-1.97 2.3-.88.45-1.94.67-3.18.67-.87 0-1.64-.13-2.34-.4-.7-.27-1.3-.65-1.79-1.15-.5-.5-.88-1.1-1.16-1.8-.28-.7-.42-1.47-.42-2.3 0-.82.14-1.59.43-2.3.29-.71.69-1.32 1.2-1.83.51-.51 1.11-.9 1.82-1.18.71-.28 1.49-.42 2.33-.42.96 0 1.8.18 2.5.55.7.37 1.27.86 1.72 1.47.45.61.77 1.3.97 2.08.2.78.27 1.59.21 2.44h-7.84c0-.81.22-1.44.65-1.9zM17.06 8.6c-.38-.41-.93-.62-1.65-.62-.48 0-.88.08-1.19.24-.31.16-.56.36-.74.6-.18.24-.31.49-.38.76-.07.27-.11.52-.12.74h4.82c-.06-.77-.35-1.35-.74-1.72zM14.92 4.5h5.41v1.38h-5.41V4.5z"/>
  </svg>
);

const IconPinterest = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
);

export const PLATFORM_TABS = [
  { id: 'all', label: 'All', icon: IconAll },
  { id: 'Instagram', label: 'Instagram', icon: IconInstagram },
  { id: 'X', label: 'X (Twitter)', icon: IconX },
  { id: 'Dribbble', label: 'Dribbble', icon: IconDribbble },
  { id: 'Behance', label: 'Behance', icon: IconBehance },
  { id: 'Pinterest', label: 'Pinterest', icon: IconPinterest },
  { id: 'Web', label: 'Web', icon: Globe },
];

export const UI_TASTES_CATEGORIES = [
  'Landing Pages',
  'Dashboard',
  'Mobile App',
  'Forms',
  'SaaS',
  'Fintech',
  'E-commerce',
  'Components',
  'Pricing',
  'Testimonials',
  'Navigation',
  'Cards',
  'CTA'
];

export const TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos & Reels', icon: PlayCircle },
  { id: 'image', label: 'Static Screenshots', icon: ImageIcon }
];

export const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' }
];

export default function UITasteFilterBar({
  activePlatform,
  setActivePlatform,
  selectedCategory,
  setSelectedCategory,
  selectedCategories = [],
  setSelectedCategories = () => {},
  selectedType,
  setSelectedType,
  selectedTag,
  setSelectedTag,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  filteredCount,
  savedCount = 0,
  onResetFilters
}) {
  // Expand state for full-width categories tray
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  // Manage which dropdown on the right is open ('type' | 'sort' | null)
  const [openDropdown, setOpenDropdown] = useState(null);
  const rightControlsRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rightControlsRef.current && !rightControlsRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openDropdown]);

  // Category multi-select toggle
  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      const exists = prev.includes(cat);
      const next = exists ? prev.filter(c => c !== cat) : [...prev, cat];
      if (setSelectedCategory) {
        setSelectedCategory(next.length === 1 ? next[0] : (next.length === 0 ? 'All' : next[0]));
      }
      return next;
    });
  };

  const removeCategory = (cat) => {
    setSelectedCategories(prev => {
      const next = prev.filter(c => c !== cat);
      if (setSelectedCategory) {
        setSelectedCategory(next.length === 1 ? next[0] : (next.length === 0 ? 'All' : next[0]));
      }
      return next;
    });
  };

  const isTypeActive = selectedType && selectedType !== 'all';
  const isSortActive = sortBy && sortBy !== 'newest';
  const hasActiveCategories = selectedCategories.length > 0 || (selectedCategory && selectedCategory !== 'All');

  const hasAnyActiveFilter = 
    activePlatform !== 'all' || 
    hasActiveCategories || 
    isTypeActive || 
    selectedTag !== null ||
    searchQuery.trim().length > 0 ||
    isSortActive;

  const currentTypeOption = TYPE_OPTIONS.find(t => t.id === selectedType) || TYPE_OPTIONS[0];
  const currentSortOption = SORT_OPTIONS.find(s => s.id === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="ui-taste-filter-bar">
      {/* ── ROW 1: Consolidated Bar (Categories Toggle + Source Tabs on Left · Type, Search & Sort on Right) ── */}
      <div className="ui-taste-top-row">
        {/* Left Side: Circular Chevron + Categories Tab + Social Platform Tabs */}
        <div className="ui-taste-top-left">
          <div className="ui-taste-categories-tab-group">
            <button
              type="button"
              className={`collapse-btn ${isCategoriesExpanded ? 'active' : ''}`}
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              title={isCategoriesExpanded ? "Collapse Categories" : "Expand Categories"}
            >
              <ChevronDown size={16} strokeWidth={3} className="arrow-icon" />
            </button>
            <button
              type="button"
              className={`filter-tab ${isCategoriesExpanded || selectedCategories.length > 0 ? 'active' : ''}`}
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
            >
              <span>Categories</span>
              {selectedCategories.length > 0 && (
                <span className="ui-taste-tab-count">{selectedCategories.length}</span>
              )}
            </button>
          </div>

          {/* Social Platforms Pill Tab Track (Untouched, height 40px) */}
          <div className="ui-taste-tabs-track">
            {PLATFORM_TABS.map((tab) => {
              const isActive = activePlatform === tab.id;
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`ui-taste-tab-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActivePlatform(tab.id)}
                >
                  {IconComponent && <IconComponent size={14} weight="bold" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Type Dropdown + Search Pill + Sort Dropdown (40px) */}
        <div className="ui-taste-top-right" ref={rightControlsRef}>
          {/* Type Dropdown */}
          <div className="ui-taste-dropdown-wrapper">
            <button
              type="button"
              className={`ui-taste-dropdown-btn ${openDropdown === 'type' ? 'is-open' : ''} ${isTypeActive ? 'is-active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              aria-haspopup="listbox"
              aria-expanded={openDropdown === 'type'}
            >
              <span>Type: <strong>{currentTypeOption.label}</strong></span>
              <CaretDown 
                size={12} 
                weight="bold" 
                className={`ui-taste-caret ${openDropdown === 'type' ? 'is-open' : ''}`} 
              />
            </button>

            {openDropdown === 'type' && (
              <div className="ui-taste-dropdown-menu" role="listbox">
                {TYPE_OPTIONS.map((typeOpt) => {
                  const isSelected = (!selectedType && typeOpt.id === 'all') || selectedType === typeOpt.id;
                  const IconComp = typeOpt.icon;
                  return (
                    <button
                      key={typeOpt.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`ui-taste-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedType(typeOpt.id);
                        setOpenDropdown(null);
                      }}
                    >
                      <span className="ui-taste-item-label">
                        {IconComp && <IconComp size={14} weight="bold" />}
                        {typeOpt.label}
                      </span>
                      {isSelected && <Check size={13} weight="bold" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Pill */}
          <div className="ui-taste-search-pill">
            <MagnifyingGlass size={15} weight="bold" className="ui-taste-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ui-taste-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="ui-taste-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <XPhosphor size={12} weight="bold" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="ui-taste-dropdown-wrapper">
            <button
              type="button"
              className={`ui-taste-dropdown-btn ${openDropdown === 'sort' ? 'is-open' : ''} ${isSortActive ? 'is-active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              aria-haspopup="listbox"
              aria-expanded={openDropdown === 'sort'}
            >
              <span>Sort: <strong>{currentSortOption.label}</strong></span>
              <CaretDown 
                size={12} 
                weight="bold" 
                className={`ui-taste-caret ${openDropdown === 'sort' ? 'is-open' : ''}`} 
              />
            </button>

            {openDropdown === 'sort' && (
              <div className="ui-taste-dropdown-menu align-right" role="listbox">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = (!sortBy && opt.id === 'newest') || sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`ui-taste-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSortBy(opt.id);
                        setOpenDropdown(null);
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={13} weight="bold" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FULL-WIDTH EXPANDABLE CATEGORIES TRAY (Ref.Design Existing Design) ── */}
      <div className={`filter-categories-wrapper ui-taste-categories-wrapper ${isCategoriesExpanded ? 'expanded' : ''}`}>
        <div className="filter-categories-inner">
          <div className="category-filter-expanded">
            {/* Multi-Row Categories Text Grid (~16px text) */}
            <div className="cfe-tags-grid ui-taste-categories-grid">
              {UI_TASTES_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`cfe-tag ui-taste-cfe-tag ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Multi-Select Chips Row */}
            {selectedCategories.length > 0 && (
              <div className="cfe-chips-container ui-taste-chips-container">
                {selectedCategories.map((cat) => (
                  <div key={cat} id={`chip-${cat}`} className="cfe-chip selected-chip">
                    <span>{cat}</span>
                    <button
                      type="button"
                      className="cfe-chip-remove"
                      onClick={() => removeCategory(cat)}
                      aria-label={`Remove ${cat}`}
                    >
                      <XPhosphor size={14} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Bottom Status Row (Result Count on Left + Reset) ── */}
      <div className="ui-taste-bottom-row">
        <div className="ui-taste-bottom-left">
          <span className="ui-taste-count-text">
            {filteredCount} {filteredCount === 1 ? 'Inspiration' : 'Inspirations'}
          </span>
          {hasAnyActiveFilter && (
            <button
              type="button"
              className="ui-taste-reset-btn"
              onClick={onResetFilters}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
