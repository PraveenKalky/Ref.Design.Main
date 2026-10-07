import React, { useState, useRef, useEffect } from 'react';
import { 
  FadersHorizontal, 
  CaretDown, 
  BookmarkSimple, 
  MagnifyingGlass, 
  X,
  PlayCircle,
  Image as ImageIcon,
  Check
} from '@phosphor-icons/react';
import './UITasteFilterBar.css';

export const PLATFORM_TABS = [
  { id: 'all', label: 'All' },
  { id: 'Instagram', label: 'Instagram' },
  { id: 'X', label: 'X (Twitter)' },
  { id: 'Dribbble', label: 'Dribbble' },
  { id: 'Behance', label: 'Behance' },
  { id: 'Pinterest', label: 'Pinterest' },
  { id: 'Web', label: 'Web' },
  { id: 'upload', label: 'Uploaded' },
  { id: 'saved', label: 'Saved', isSavedTab: true }
];

export const CATEGORY_OPTIONS = [
  'All',
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

export const TAG_OPTIONS = [
  'Dark Mode',
  '3D',
  'Motion',
  'Bento',
  'Typography',
  'Interaction Design'
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  const hasActiveExpandedFilters = 
    (selectedCategory && selectedCategory !== 'All') || 
    (selectedType && selectedType !== 'all') || 
    selectedTag !== null;

  const hasAnyActiveFilter = 
    activePlatform !== 'all' || 
    hasActiveExpandedFilters || 
    searchQuery.trim().length > 0;

  return (
    <div className="ui-taste-filter-bar">
      {/* ── ROW 1: Consolidated Bar (Tabs on Left · Search & Filters on Right) ── */}
      <div className="ui-taste-top-row">
        {/* Left Side: Source Tabs */}
        <div className="ui-taste-tabs-track">
          {PLATFORM_TABS.map((tab) => {
            const isActive = activePlatform === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`ui-taste-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => setActivePlatform(tab.id)}
              >
                {tab.isSavedTab && (
                  <BookmarkSimple 
                    size={14} 
                    weight={isActive ? "fill" : "regular"} 
                  />
                )}
                <span>{tab.label}</span>
                {tab.isSavedTab && savedCount > 0 && (
                  <span className="ui-taste-tab-count">{savedCount}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Search + Filters Button */}
        <div className="ui-taste-top-right">
          <div className="ui-taste-search-pill">
            <MagnifyingGlass size={15} weight="bold" className="ui-taste-search-icon" />
            <input
              type="text"
              placeholder="Search inspirations..."
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
                <X size={12} weight="bold" />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`ui-taste-filters-btn ${isFiltersOpen ? 'is-open' : ''} ${hasActiveExpandedFilters ? 'has-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            aria-expanded={isFiltersOpen}
          >
            <FadersHorizontal size={16} weight="bold" />
            <span>Filters</span>
            <CaretDown 
              size={13} 
              weight="bold" 
              className={`ui-taste-caret ${isFiltersOpen ? 'is-open' : ''}`} 
            />
          </button>
        </div>
      </div>

      {/* ── ROW 2: When Filters Clicked (Ref.Design Soft Background, No Outlines) ── */}
      {isFiltersOpen && (
        <div className="ui-taste-expanded-panel">
          {/* Category Filter */}
          <div className="ui-taste-panel-row">
            <span className="ui-taste-panel-label">Category:</span>
            <div className="ui-taste-pill-group">
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = (cat === 'All' && (!selectedCategory || selectedCategory === 'All')) || selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`ui-taste-pill ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedCategory(cat === 'All' ? 'All' : cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Filter */}
          <div className="ui-taste-panel-row">
            <span className="ui-taste-panel-label">Type:</span>
            <div className="ui-taste-pill-group">
              {TYPE_OPTIONS.map((typeOpt) => {
                const isActive = (!selectedType && typeOpt.id === 'all') || selectedType === typeOpt.id;
                const IconComponent = typeOpt.icon;
                return (
                  <button
                    key={typeOpt.id}
                    type="button"
                    className={`ui-taste-pill ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedType(typeOpt.id)}
                  >
                    {IconComponent && <IconComponent size={14} weight="bold" />}
                    <span>{typeOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="ui-taste-panel-row">
            <span className="ui-taste-panel-label">Tags:</span>
            <div className="ui-taste-pill-group">
              {TAG_OPTIONS.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`ui-taste-pill ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedTag(isActive ? null : tag)}
                  >
                    <span>{tag}</span>
                    {isActive && <X size={11} weight="bold" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ROW 3: Left Result Count · Right Sort Dropdown ── */}
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

        {/* Sort Dropdown using Fonts page pattern */}
        <div className="sort-container" ref={sortDropdownRef}>
          <button
            type="button"
            className="fcb-action-btn fcb-sort sort-trigger"
            onClick={() => setIsSortOpen(!isSortOpen)}
            aria-expanded={isSortOpen}
          >
            <span>Sort: {SORT_OPTIONS.find(s => s.id === sortBy)?.label || 'Newest'}</span>
            <CaretDown 
              size={13} 
              weight="bold" 
              className={`ui-taste-caret ${isSortOpen ? 'is-open' : ''}`} 
            />
          </button>

          <div className={`sort-dropdown ${isSortOpen ? 'open' : ''}`} role="listbox">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={sortBy === opt.id}
                className={`sort-option ${sortBy === opt.id ? 'selected' : ''}`}
                onClick={() => {
                  setSortBy(opt.id);
                  setIsSortOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {sortBy === opt.id && <Check size={14} weight="bold" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
