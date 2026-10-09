import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronDown, 
  X as XIcon, 
  SlidersHorizontal 
} from 'lucide-react';
import { 
  MagnifyingGlass, 
  UploadSimple, 
  Check, 
  Sparkle,
  ArrowDown,
  ArrowRight,
  X as XPhosphor
} from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';
import { SectionCard } from '../../components/card-grid/SectionsGrid';
import Pagination from '../../components/pagination/Pagination';
import SectionUploadDrawer from './components/SectionUploadDrawer';
import { 
  ALL_SECTION_CATEGORIES,
  SECTION_CATEGORY_GROUPS,
  SIDEBAR_TO_SECTION_TYPE 
} from '../../data/section-categories';
import { classifySection } from '../../utils/sectionTaxonomy';
import heroBg from '../../assets/sections-hero-bg.png';
import './sections-page.css';

const ITEMS_PER_PAGE = 24;

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

// Curated category tab mapping matching Ref.Design filter architecture
const SECTION_TABS = [
  { id: 'popular', label: 'Popular Sections' },
  { id: 'marketing', label: 'Marketing & Conversion' },
  { id: 'structure', label: 'Structure & Nav' },
  { id: 'data', label: 'Data & Dashboard' },
  { id: 'auth', label: 'Auth & Forms' },
  { id: 'all_categories', label: 'All Categories' }
];

const TAB_CATEGORIES = {
  'Popular Sections': [
    'Hero', 'Features', 'Pricing', 'Testimonials', 'CTA', 
    'Footer', 'Navigation', 'FAQs', 'Bento Grid', 'Dashboard', 
    'Blog', 'Logo Cloud', 'Team', 'About', 'Contact'
  ],
  'Marketing & Conversion': [
    'Features', 'CTA', 'Pricing', 'Testimonials', 'Social Proof', 
    'Stats', 'Comparisons', 'Trust Badges', 'Roadmap', 'Product Showcase'
  ],
  'Structure & Nav': [
    'Navigation', 'Hero', 'Footer', 'Sidebar', 'Header', 'Breadcrumb', 'Banner'
  ],
  'Data & Dashboard': [
    'Dashboard', 'Tables', 'Charts', 'Analytics', 'Bento Grid', 
    'Deposit', 'Withdraw', 'Wallet', 'Order Book', 'Trading', 'API Docs', 'Integrations'
  ],
  'Auth & Forms': [
    'Sign In', 'Sign Up', 'Onboarding', 'Contact', 'Lead Gen', 
    'Profile', 'Settings', 'Survey', 'Multi-step Form'
  ],
  'All Categories': ALL_SECTION_CATEGORIES
};

export default function SectionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterBarRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter & Search states
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('popular');
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const param = searchParams.get('category');
    return param ? [param] : [];
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearchOpen, setIsSearchOpen] = useState(() => Boolean(searchParams.get('q')));
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'website' | 'standalone'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'az'
  const [currentPage, setCurrentPage] = useState(1);

  // Data states
  const [sections, setSections] = useState([]);
  const [carouselData, setCarouselData] = useState([]);
  const [publishedPageSections, setPublishedPageSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast trigger
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Fetch sections from Supabase (combines website_sections + website_pages media)
  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch from website_sections table
      const { data: dbSections } = await supabase
        .from('website_sections')
        .select(`
          id,
          section_type,
          section_title,
          image_url,
          thumbnail_url,
          page_url,
          website_url,
          is_standalone,
          tags,
          description,
          status,
          created_at,
          submissions:website_id (
            id,
            title,
            normalised_url,
            logo_url
          )
        `)
        .order('created_at', { ascending: false });

      let combined = Array.isArray(dbSections) ? dbSections.map(s => {
        const classification = classifySection(s.section_title || s.section_type || '');
        return {
          ...s,
          section_type: s.section_type || classification.category || 'Section',
          section_title: s.section_title || classification.title || 'Section',
          category: s.category || classification.category,
          tags: Array.isArray(s.tags) && s.tags.length > 0 ? s.tags : classification.tags
        };
      }) : [];

      // Only fetch standalone sections for the main grid
      setSections(combined);

      // Fetch from website_pages to extract published sections and populate the carousel
      const { data: pagesData } = await supabase
        .from('website_pages')
        .select(`id, url, media, created_at, page_title`)
        .limit(50);

      const carouselItems = [];
      const pageSections = [];
      if (pagesData && Array.isArray(pagesData)) {
        pagesData.forEach(page => {
          if (Array.isArray(page.media)) {
            page.media.forEach((m) => {
              if (m.url) {
                let title = (m && typeof m === 'object' && m.title && m.title !== 'Deposit' && m.title !== 'Deposite')
                  ? m.title : (m.filename || 'Section');
                
                // Clean up title (remove extension if filename)
                title = title.replace(/\.[^/.]+$/, "");

                const classification = classifySection(title);
                pageSections.push({
                  section_title: title,
                  section_type: classification.category || 'Section',
                  category: classification.category,
                  tags: classification.tags || []
                });

                if (carouselItems.length < 10) {
                  carouselItems.push({
                    id: m.url,
                    section_title: title,
                    image_url: m.url,
                    thumbnail_url: m.thumbnailUrl || m.url
                  });
                }
              }
            });
          }
        });
      }
      setCarouselData(carouselItems);
      setPublishedPageSections(pageSections);
      
    } catch (err) {
      console.error('Unexpected error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Dynamic category counts calculated from actual published section data
  const categoryCounts = useMemo(() => {
    const counts = {};
    const allPublished = [...sections, ...publishedPageSections];

    allPublished.forEach(sec => {
      const type = (sec.section_type || '').trim();
      const title = (sec.section_title || '').trim();
      const cat = (sec.category || '').trim();
      const tags = Array.isArray(sec.tags) ? sec.tags : [];

      const terms = [type, title, cat, ...tags].filter(Boolean);

      ALL_SECTION_CATEGORIES.forEach(c => {
        const cLower = c.toLowerCase();
        const matched = terms.some(t => {
          const tLower = t.toLowerCase();
          return tLower === cLower || tLower.includes(cLower) || cLower.includes(tLower);
        });
        if (matched) {
          counts[c] = (counts[c] || 0) + 1;
        }
      });
    });

    return counts;
  }, [sections, publishedPageSections]);

  // Toggle category selection
  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      const exists = prev.includes(cat);
      const next = exists ? prev.filter(c => c !== cat) : [...prev, cat];
      
      const newParams = new URLSearchParams(searchParams);
      if (next.length === 0) {
        newParams.delete('category');
      } else {
        newParams.set('category', next[0]);
      }
      setSearchParams(newParams);
      return next;
    });
    setCurrentPage(1);
  };

  const removeCategoryChip = (cat) => {
    toggleCategory(cat);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setSourceFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('q');
    setSearchParams(newParams);
  };

  // Scroll smoothly to the filter section
  const scrollToFilters = () => {
    if (filterBarRef.current) {
      filterBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsExpanded(true);
    }
  };

  // Filter & Search Logic
  const filteredSections = useMemo(() => {
    let result = [...sections];

    // 1. Category Filter (multi-select)
    if (selectedCategories.length > 0) {
      const selectedLower = selectedCategories.map(c => c.toLowerCase());
      result = result.filter(s => {
        const typeLower = (s.section_type || '').toLowerCase();
        const titleLower = (s.section_title || '').toLowerCase();
        const categoryLower = (s.category || '').toLowerCase();
        const tagsLower = Array.isArray(s.tags) ? s.tags.map(t => t.toLowerCase()) : [];
        return selectedLower.some(cat => 
          typeLower.includes(cat) || 
          categoryLower.includes(cat) ||
          titleLower.includes(cat) ||
          tagsLower.some(t => t.includes(cat))
        );
      });
    }

    // 2. Source Filter
    if (sourceFilter === 'standalone') {
      result = result.filter(s => s.is_standalone === true || !s.submissions);
    } else if (sourceFilter === 'website') {
      result = result.filter(s => s.is_standalone !== true && !!s.submissions);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s => {
        const titleMatch = (s.section_title || '').toLowerCase().includes(q);
        const typeMatch = (s.section_type || '').toLowerCase().includes(q);
        const websiteMatch = s.submissions?.title?.toLowerCase().includes(q) || 
                             s.submissions?.normalised_url?.toLowerCase().includes(q) ||
                             (s.website_url || '').toLowerCase().includes(q);
        const tagsMatch = Array.isArray(s.tags) && s.tags.some(t => t.toLowerCase().includes(q));
        const descMatch = (s.description || '').toLowerCase().includes(q);
        return titleMatch || typeMatch || websiteMatch || tagsMatch || descMatch;
      });
    }

    // 4. Sort
    if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sortBy === 'az') {
      result.sort((a, b) => (a.section_title || a.section_type || '').localeCompare(b.section_title || b.section_type || ''));
    } else {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return result;
  }, [sections, selectedCategories, sourceFilter, searchQuery, sortBy]);

  // Current tab items to display in expanded drawer
  const currentTabLabel = SECTION_TABS.find(t => t.id === activeTab)?.label || 'Popular Sections';
  const visibleCategories = TAB_CATEGORIES[currentTabLabel] || TAB_CATEGORIES['Popular Sections'];

  // Pagination calculation
  const totalPages = Math.ceil(filteredSections.length / ITEMS_PER_PAGE);
  const currentCards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSections.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSections, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 580, behavior: 'smooth' });
  };

  const handleCardClick = (id) => {
    navigate(`/sections/${id}`);
  };

  return (
    <div className="sections-page">
      {/* ── Craftwork-Inspired Atmospheric Hero ── */}
      <section className="sections-craft-hero">
        <div className="sections-hero-container">
          {/* Floating Pill Announcement Badge */}
          <div className="sections-hero-badge-wrap">
            <button 
              type="button" 
              onClick={scrollToFilters}
              className="sections-hero-badge"
            >
              <span>Ref.Design Curated Section Library</span>
              <ArrowRight size={13} weight="bold" className="sections-hero-badge-arrow" />
            </button>
          </div>

          {/* High-Impact Headline */}
          <h1 className="sections-hero-title">
            Website sections you can<br />actually build with.
          </h1>

          {/* Subtitle */}
          <p className="sections-hero-desc">
            Hero, Bento Grids, Features, Pricing, Footers, and Testimonials.
            <br />
            Production UI screenshots from the world's most notable digital products, free to study, copy, and save.
          </p>

          {/* Dual Action Buttons */}
          <div className="sections-hero-cta-group">
            <button 
              type="button" 
              onClick={scrollToFilters}
              className="sections-cta-primary sweep-shuffle-btn"
            >
              <div className="btn-content">
                <AnimatedText text="Browse 60+ Categories" />
                <ArrowDown size={15} weight="bold" />
              </div>
            </button>
            <button 
              type="button" 
              onClick={() => setIsUploadOpen(true)}
              className="sections-cta-secondary sweep-shuffle-btn"
            >
              <div className="btn-content">
                <UploadSimple size={16} weight="bold" />
                <AnimatedText text="Upload Section" />
              </div>
            </button>
          </div>
        </div>

        {/* ── Continuous Horizontal Scrolling Carousel ── */}
        {carouselData.length > 0 && (
          <div className="sections-hero-carousel">
            <div className="hero-scrolling-track">
              {/* Render two identical groups of cards to create a mathematically perfect infinite loop */}
              <div className="carousel-group">
                {carouselData.map((sec, idx) => (
                  <div 
                    key={`carousel-g1-${sec.id}-${idx}`} 
                    className="hero-carousel-card"
                    onClick={() => handleCardClick(sec.id)}
                    title={sec.section_title}
                  >
                    <div className="hero-carousel-image-wrap">
                      <img 
                        src={sec.thumbnail_url || sec.image_url} 
                        alt={sec.section_title} 
                        loading="lazy"
                      />
                    </div>
                    <div className="hero-carousel-title-wrap">
                      <span className="hcc-title">{sec.section_title || sec.section_type || 'Section'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="carousel-group">
                {carouselData.map((sec, idx) => (
                  <div 
                    key={`carousel-g2-${sec.id}-${idx}`} 
                    className="hero-carousel-card"
                    onClick={() => handleCardClick(sec.id)}
                    title={sec.section_title}
                  >
                    <div className="hero-carousel-image-wrap">
                      <img 
                        src={sec.thumbnail_url || sec.image_url} 
                        alt={sec.section_title} 
                        loading="lazy"
                      />
                    </div>
                    <div className="hero-carousel-title-wrap">
                      <span className="hcc-title">{sec.section_title || sec.section_type || 'Section'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Native Ref.Design FilterBar Container ── */}
      <div className="filter-bar-container sections-filterbar-sticky" ref={filterBarRef}>
        <div className="filter-bar-content">
          {/* Left Side: Collapse Toggle & Category Tabs */}
          <div className="filter-tabs sections-filter-tabs">
            <button 
              className={`collapse-btn ${isExpanded ? 'active' : ''}`}
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse categories" : "Expand section categories"}
              type="button"
            >
              <ChevronDown size={16} strokeWidth={3} className="arrow-icon" />
            </button>
            <div className="sections-tabs-track">
              {SECTION_TABS.map(tab => (
                <button 
                  key={tab.id}
                  className={`sections-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (!isExpanded) setIsExpanded(true);
                  }}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Search, Source Control, Sort, and Upload CTA */}
          <div className="filter-actions sections-filter-actions">
            {/* Expandable Circular Search */}
            <div 
              className={`sections-inline-search ${isSearchOpen || searchQuery ? 'expanded' : 'collapsed'}`}
              onClick={() => {
                if (!isSearchOpen) {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }
              }}
              title={!isSearchOpen && !searchQuery ? "Search sections" : undefined}
            >
              <button 
                type="button" 
                className="sections-search-icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSearchOpen) {
                    setIsSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  } else if (!searchQuery) {
                    setIsSearchOpen(false);
                  }
                }}
                aria-label="Search sections"
              >
                <MagnifyingGlass size={16} className="sections-search-icon" />
              </button>
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => {
                  if (!searchQuery.trim()) {
                    setIsSearchOpen(false);
                  }
                }}
                className="sections-search-input"
                tabIndex={isSearchOpen || searchQuery ? 0 : -1}
              />
              {(searchQuery || isSearchOpen) && (
                <button 
                  type="button"
                  className="sections-search-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    setIsSearchOpen(false);
                    setCurrentPage(1);
                  }}
                  title="Close search"
                  aria-label="Close search"
                >
                  <XIcon size={13} />
                </button>
              )}
            </div>

            {/* Source Segmented Control */}
            <div className="sections-source-toggle">
              <button 
                type="button"
                className={`sections-source-tab ${sourceFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setSourceFilter('all'); setCurrentPage(1); }}
              >
                All
              </button>
              <button 
                type="button"
                className={`sections-source-tab ${sourceFilter === 'website' ? 'active' : ''}`}
                onClick={() => { setSourceFilter('website'); setCurrentPage(1); }}
              >
                Websites
              </button>
              <button 
                type="button"
                className={`sections-source-tab ${sourceFilter === 'standalone' ? 'active' : ''}`}
                onClick={() => { setSourceFilter('standalone'); setCurrentPage(1); }}
              >
                Standalone
              </button>
            </div>
          </div>
        </div>

        {/* ── Expandable Category Tag Cloud (Signature Ref.Design Pattern) ── */}
        <div className={`filter-categories-wrapper ${isExpanded ? 'expanded' : ''}`}>
          <div className="category-filter-expanded">
            {/* Row 1: Large typography category tags with hover count pill */}
            <div className="cfe-tags-grid">
              {visibleCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    className={`cfe-tag ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat)}
                    type="button"
                  >
                    <span>{cat}</span>
                    <span className="cfe-tag-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Active Selected Chips with animated exit */}
            {selectedCategories.length > 0 && (
              <div className="cfe-chips-container">
                {selectedCategories.map(item => (
                  <div key={item} className="cfe-chip selected-chip">
                    <span>{item}</span>
                    <button
                      className="cfe-chip-remove"
                      onClick={() => removeCategoryChip(item)}
                      aria-label={`Remove ${item}`}
                      type="button"
                    >
                      <XIcon size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  className="sections-clear-chips-btn"
                  onClick={() => setSelectedCategories([])}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Full-Width Grid (Matching Home & Websites Pages) ── */}
      <section className="card-grid-section sections-main-grid-section">
        {/* Active Search & Source Filter Reminder Bar */}
        {(searchQuery || sourceFilter !== 'all') && (
          <div className="sections-filter-status-bar">
            <span>
              Showing {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''}
              {searchQuery && <> matching <strong>"{searchQuery}"</strong></>}
              {sourceFilter !== 'all' && <> from <strong>{sourceFilter === 'website' ? 'Websites' : 'Standalone Uploads'}</strong></>}
            </span>
            <button type="button" onClick={clearAllFilters} className="sections-status-reset">
              Reset search & source
            </button>
          </div>
        )}

        {/* Loading / Cards Grid */}
        {loading ? (
          <div className="sections-loading-container">
            <div className="sections-loading-spinner" />
            <p>Loading sections library...</p>
          </div>
        ) : currentCards.length === 0 ? (
          <div className="sections-empty-container">
            <div className="sections-empty-state">
              <h3>No sections found</h3>
              <p>Upload a standalone section to start building your library.</p>
              <button onClick={() => setIsUploadOpen(true)} className="sections-cta-secondary sweep-shuffle-btn">
                <div className="btn-content">
                  <AnimatedText text="Upload Section" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="card-grid">
            {currentCards.map(sec => (
              <div 
                key={sec.id} 
                className="sections-card-wrapper"
                onClick={() => handleCardClick(sec.id)}
              >
                <SectionCard 
                  id={sec.id}
                  section_type={sec.section_type}
                  section_title={sec.section_title}
                  image_url={sec.image_url || sec.thumbnail_url}
                  thumbnail_url={sec.thumbnail_url}
                  page_url={sec.page_url || sec.website_url}
                  status={sec.status}
                  parentWebsite={sec.submissions}
                  onToast={addToast}
                  onUpdateSection={(id, updated) => {
                    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
                  }}
                  onDeleteSection={(id) => {
                    setSections(prev => prev.filter(s => s.id !== id));
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination matching Home & Websites */}
        {!loading && totalPages > 1 && (
          <div className="sections-pagination-wrap">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>

      {/* ── Upload Section Drawer ── */}
      <SectionUploadDrawer 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={({ count, status }) => {
          if (status === 'Draft') {
            addToast(
              `${count} section${count > 1 ? 's' : ''} saved as draft!`,
              'info'
            );
          } else {
            addToast(
              `${count} section${count > 1 ? 's' : ''} published to the library!`,
              'success'
            );
          }
          fetchSections();
        }}
      />

      {/* ── Toast Notifications ── */}
      {toasts.length > 0 && typeof document !== 'undefined' && createPortal(
        <div className="lm-toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="lm-toast">
              <div className={`lm-toast-icon lm-toast-${toast.type || 'success'}`}>
                {toast.type === 'error' ? <XPhosphor size={13} weight="bold" /> : <Check size={13} strokeWidth={2.5} />}
              </div>
              <span className="lm-toast-msg">{toast.message}</span>
              <button 
                type="button"
                className="lm-toast-close" 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                aria-label="Close notification"
              >
                <XPhosphor size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
