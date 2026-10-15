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
import { isVideoMedia } from '../../utils/mediaUtils';
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

// ── Memoized Hero Carousel Card Component ──
// Isolates card rendering and video playback controls to completely eliminate
// inline-ref thrashing and unnecessary re-renders during 60 FPS animation.
const HeroCarouselCard = React.memo(({ sec, onCardClick }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!sec.isVideo || !videoRef.current) return;
    const v = videoRef.current;
    v.muted = true;
    v.defaultMuted = true;
    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }, [sec.isVideo, sec.mediaUrl]);

  return (
    <div 
      className="hero-carousel-card"
      onClick={() => onCardClick(sec.id)}
    >
      <div className="hero-carousel-image-wrap">
        {sec.isVideo ? (
          <video 
            ref={videoRef}
            src={sec.mediaUrl} 
            autoPlay 
            muted 
            loop 
            playsInline 
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className="hero-carousel-image" 
          />
        ) : (
          <img 
            src={sec.mediaUrl} 
            alt={sec.section_title} 
            loading="eager"
            decoding="async"
            className="hero-carousel-image" 
          />
        )}
      </div>
      <div className="hero-carousel-title-wrap">
        <span className="hcc-title">{sec.section_title || sec.section_type || 'Section'}</span>
      </div>
    </div>
  );
});

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
  const heroRef = useRef(null);
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
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get('page'), 10);
    return !isNaN(p) && p > 0 ? p : 1;
  });
  const [totalMatchingSections, setTotalMatchingSections] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});

  // In-memory query cache for 0ms instant back-navigation
  const queryCacheRef = useRef({});

  // Data states
  const [sections, setSections] = useState([]);
  const [carouselData, setCarouselData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Carousel animation & scroll-responsiveness refs
  const carouselTrackRef = useRef(null);
  const halfWidthRef = useRef(0);
  const isCarouselHoveredRef = useRef(false);
  const scrollPosRef = useRef(0);
  const currentVelocityRef = useRef(0.05); // initialized at 50% slower base velocity
  const scrollVelocityRef = useRef(0);
  const lastScrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastScrollTimeRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0);

  // Toast trigger
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // ── Server-Side Paginated Sections Query (Strictly 24 items per page) ──
  const fetchSections = useCallback(async () => {
    setLoading(true);
    const cacheKey = JSON.stringify({
      page: currentPage,
      categories: [...selectedCategories].sort(),
      source: sourceFilter,
      search: searchQuery.trim(),
      sort: sortBy
    });

    if (queryCacheRef.current[cacheKey]) {
      const cached = queryCacheRef.current[cacheKey];
      setSections(cached.data);
      setTotalMatchingSections(cached.count);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
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
          media,
          submissions:website_id (
            id,
            title,
            normalised_url,
            logo_url
          )
        `, { count: 'exact' });

      // 1. Source filter
      if (sourceFilter === 'standalone') {
        query = query.or('is_standalone.eq.true,website_id.is.null');
      } else if (sourceFilter === 'website') {
        query = query.and('is_standalone.eq.false,website_id.not.is.null');
      }

      // 2. Categories filter
      if (selectedCategories.length > 0) {
        const orClauses = selectedCategories
          .map(cat => `section_type.ilike.%${cat}%,section_title.ilike.%${cat}%`)
          .join(',');
        query = query.or(orClauses);
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(`section_title.ilike.%${q}%,section_type.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // 4. Sort
      if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'az') {
        query = query.order('section_title', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // 5. Server-side range pagination (strictly 24 items)
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      const mapped = Array.isArray(data) ? data.map(s => {
        const classification = classifySection(s.section_title || s.section_type || '');
        return {
          ...s,
          section_type: s.section_type || classification.category || 'Section',
          section_title: s.section_title || classification.title || 'Section',
          category: s.category || classification.category,
          tags: Array.isArray(s.tags) && s.tags.length > 0 ? s.tags : classification.tags,
          media: Array.isArray(s.media) ? s.media : []
        };
      }) : [];

      queryCacheRef.current[cacheKey] = { data: mapped, count: count || 0 };
      setSections(mapped);
      setTotalMatchingSections(count || 0);
    } catch (err) {
      console.error('Error fetching paginated sections:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategories, sourceFilter, searchQuery, sortBy]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // ── Hero Carousel Data (Fetched once on mount) ──
  useEffect(() => {
    let isMounted = true;
    const fetchHeroData = async () => {
      try {
        const { data } = await supabase
          .from('website_sections')
          .select('id, section_type, section_title, image_url, thumbnail_url, media, status, created_at')
          .order('created_at', { ascending: false })
          .limit(14);

        if (!isMounted || !data) return;

        let carouselItems = data
          .filter(s => s.status !== 'Draft' && (s.image_url || s.thumbnail_url || (Array.isArray(s.media) && s.media.length > 0)))
          .map(sec => {
            let mediaUrl = sec.image_url || sec.thumbnail_url;
            let thumbnailUrl = sec.thumbnail_url || mediaUrl;
            let isVideo = isVideoMedia(mediaUrl);

            // For multi-screen collections, use the selected cover media
            if (Array.isArray(sec.media) && sec.media.length > 0) {
              const cover = sec.media.find(m => m.isCover) || sec.media[0];
              if (cover && (cover.url || cover.previewUrl)) {
                mediaUrl = cover.url || cover.previewUrl;
                thumbnailUrl = cover.thumbnailUrl || sec.thumbnail_url || mediaUrl;
                isVideo = cover.type === 'video' || isVideoMedia(mediaUrl);
              }
            }

            return {
              id: sec.id,
              section_title: sec.section_title || sec.section_type || 'Section',
              section_type: sec.section_type || 'Section',
              mediaUrl,
              thumbnailUrl,
              isVideo,
              created_at: sec.created_at
            };
          });

        if (carouselItems.length > 0 && carouselItems.length < 8) {
          const original = [...carouselItems];
          while (carouselItems.length < 8) {
            carouselItems = [...carouselItems, ...original];
          }
        }

        if (isMounted) {
          setCarouselData(carouselItems);
        }
      } catch (err) {
        console.error('Failed to load hero carousel media:', err);
      }
    };

    fetchHeroData();
    return () => { isMounted = false; };
  }, []);

  // ── Category Taxonomy Counts (Lightweight metadata fetched once) ──
  useEffect(() => {
    let isMounted = true;
    const fetchTaxonomy = async () => {
      try {
        const { data } = await supabase
          .from('website_sections')
          .select('section_type, section_title, tags');

        if (!isMounted || !data) return;

        const counts = {};
        data.forEach(sec => {
          const type = (sec.section_type || '').trim();
          const title = (sec.section_title || '').trim();
          const tags = Array.isArray(sec.tags) ? sec.tags : [];
          const terms = [type, title, ...tags].filter(Boolean);

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

        if (isMounted) {
          setCategoryCounts(counts);
        }
      } catch (err) {
        console.error('Failed to load category taxonomy:', err);
      }
    };

    fetchTaxonomy();
    return () => { isMounted = false; };
  }, []);

  // ── Scroll-Responsive Infinite Carousel Loop (Craftwork-Inspired) ──
  useEffect(() => {
    if (carouselData.length === 0) return;

    const track = carouselTrackRef.current;
    if (!track) return;

    // Cache halfWidth without forcing layout reflow on every animation frame
    const updateDimensions = () => {
      if (carouselTrackRef.current) {
        const measured = carouselTrackRef.current.scrollWidth / 2;
        if (measured > 0) {
          halfWidthRef.current = measured;
        }
      }
    };

    updateDimensions();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(track);
    } else {
      window.addEventListener('resize', updateDimensions);
    }

    let reqId;
    let lastTime = performance.now();
    lastScrollYRef.current = window.scrollY;
    lastScrollTimeRef.current = performance.now();

    const handleScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dy = currentY - lastScrollYRef.current;
      const dt = Math.max(1, now - lastScrollTimeRef.current);
      lastScrollYRef.current = currentY;
      lastScrollTimeRef.current = now;

      // When already at the top of the page (scrollY <= 0) and attempting to scroll up:
      // Do NOT trigger any scroll-based acceleration or reversal. Keep normal automatic loop.
      if (currentY <= 0 && dy <= 0) {
        scrollVelocityRef.current = 0;
        return;
      }

      // Normal scroll through the page (scrolling down or scrolling up from below):
      const clampedDy = Math.max(-120, Math.min(120, dy));
      scrollVelocityRef.current = clampedDy / dt;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = (now) => {
      const dt = Math.min(32, Math.max(8, now - lastTime));
      lastTime = now;

      let halfWidth = halfWidthRef.current;
      if (halfWidth <= 0) {
        updateDimensions();
        halfWidth = halfWidthRef.current;
        if (halfWidth <= 0) {
          reqId = requestAnimationFrame(animate);
          return;
        }
      }

      // Exactly 50% slower default speed: full cycle takes 80s instead of 40s
      const baseVelocity = halfWidth / 80000;

      // Smooth decay of scroll velocity towards 0 when scrolling stops
      scrollVelocityRef.current *= 0.88;
      if (Math.abs(scrollVelocityRef.current) < 0.001) {
        scrollVelocityRef.current = 0;
      }

      let targetVelocity = baseVelocity;
      if (isCarouselHoveredRef.current && scrollVelocityRef.current === 0) {
        // Smoothly pause on hover when user is not actively scrolling
        targetVelocity = 0;
      } else if (scrollVelocityRef.current > 0) {
        // Scroll down: cards accelerate in original direction (right to left)
        targetVelocity = baseVelocity + scrollVelocityRef.current * 0.8;
      } else if (scrollVelocityRef.current < 0) {
        // Scroll up from below: cards move left to right, accelerating based on scroll speed
        targetVelocity = scrollVelocityRef.current * 0.8;
      }

      // Cap maximum velocity to prevent sudden teleporting during extreme flick scrolls
      targetVelocity = Math.max(-1.8, Math.min(2.2, targetVelocity));

      // Premium easing between current and target velocity
      currentVelocityRef.current += (targetVelocity - currentVelocityRef.current) * 0.10;

      scrollPosRef.current += currentVelocityRef.current * dt;

      // Mathematically seamless infinite loop wrap in both directions
      if (scrollPosRef.current >= halfWidth) {
        scrollPosRef.current %= halfWidth;
      } else if (scrollPosRef.current < 0) {
        scrollPosRef.current = ((scrollPosRef.current % halfWidth) + halfWidth) % halfWidth;
      }

      track.style.transform = `translate3d(${-scrollPosRef.current}px, 0, 0)`;

      reqId = requestAnimationFrame(animate);
    };

    reqId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', updateDimensions);
      }
      if (reqId) cancelAnimationFrame(reqId);
    };
  }, [carouselData.length]);

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
      newParams.delete('page');
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
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
  };

  // Scroll smoothly to the filter section
  const scrollToFilters = () => {
    if (filterBarRef.current) {
      filterBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsExpanded(true);
    }
  };

  // Current tab items to display in expanded drawer
  const currentTabLabel = SECTION_TABS.find(t => t.id === activeTab)?.label || 'Popular Sections';
  const visibleCategories = TAB_CATEGORIES[currentTabLabel] || TAB_CATEGORIES['Popular Sections'];

  // Responsive Masonry column count (3 on desktop >1024px, 2 on tablet 641px-1024px, 1 on mobile <=640px)
  const [columnCount, setColumnCount] = useState(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const nextCount = width <= 640 ? 1 : width <= 1024 ? 2 : 3;
      setColumnCount(prev => (prev !== nextCount ? nextCount : prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Server-side pagination calculation
  const totalPages = Math.max(1, Math.ceil(totalMatchingSections / ITEMS_PER_PAGE));

  // Distribute server-paginated cards round-robin across columns for natural left-to-right reading order
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    sections.forEach((sec, index) => {
      cols[index % columnCount].push(sec);
    });
    return cols;
  }, [sections, columnCount]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    if (page === 1) newParams.delete('page');
    else newParams.set('page', page);
    setSearchParams(newParams);
    if (filterBarRef.current) {
      filterBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 580, behavior: 'smooth' });
    }
  };

  const handleCardClick = useCallback((id) => {
    navigate(`/sections/${id}`);
  }, [navigate]);

  return (
    <div className="sections-page">
      {/* ── Craftwork-Inspired Atmospheric Hero ── */}
      <section ref={heroRef} className="sections-craft-hero">
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
          <div 
            className="sections-hero-carousel"
            onMouseEnter={() => { isCarouselHoveredRef.current = true; }}
            onMouseLeave={() => { isCarouselHoveredRef.current = false; }}
          >
            <div ref={carouselTrackRef} className="hero-scrolling-track">
              {/* Render two identical groups of cards to create a mathematically perfect infinite loop */}
              <div className="carousel-group">
                {carouselData.map((sec, idx) => (
                  <HeroCarouselCard 
                    key={`carousel-g1-${sec.id}-${idx}`}
                    sec={sec}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
              <div className="carousel-group">
                {carouselData.map((sec, idx) => (
                  <HeroCarouselCard 
                    key={`carousel-g2-${sec.id}-${idx}`}
                    sec={sec}
                    onCardClick={handleCardClick}
                  />
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
        {(searchQuery || sourceFilter !== 'all' || selectedCategories.length > 0) && (
          <div className="sections-filter-status-bar">
            <span>
              Showing {totalMatchingSections} section{totalMatchingSections !== 1 ? 's' : ''}
            </span>
            <button type="button" onClick={clearAllFilters} className="sections-status-reset">
              Reset all filters
            </button>
          </div>
        )}

        {/* Loading / Cards Grid */}
        {loading ? (
          <div className="sections-loading-container">
            <div className="sections-loading-spinner" />
            <p>Loading sections library...</p>
          </div>
        ) : sections.length === 0 ? (
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
          <div className="sections-masonry-grid">
            {columns.map((colCards, colIdx) => (
              <div key={colIdx} className="sections-masonry-col">
                {colCards.map(sec => (
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
                      media={sec.media}
                      onToast={addToast}
                      onEditSection={() => {
                        setEditingSection(sec);
                        setIsUploadOpen(true);
                      }}
                      onUpdateSection={(id, updated) => {
                        setSections(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
                        queryCacheRef.current = {};
                      }}
                      onDeleteSection={(id) => {
                        setSections(prev => prev.filter(s => s.id !== id));
                        setTotalMatchingSections(prev => Math.max(0, prev - 1));
                        queryCacheRef.current = {};
                      }}
                    />
                  </div>
                ))}
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
              totalItems={totalMatchingSections}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>

      {/* ── Upload / Edit Section Drawer ── */}
      <SectionUploadDrawer 
        isOpen={isUploadOpen}
        initialSection={editingSection}
        onClose={() => {
          setIsUploadOpen(false);
          setEditingSection(null);
        }}
        onUploadSuccess={({ count, status, isEdit, updatedSection }) => {
          if (isEdit) {
            addToast(status === 'Draft' ? 'Section saved as draft!' : 'Section updated successfully!', 'success');
            if (updatedSection) {
              setSections(prev => prev.map(s => s.id === updatedSection.id ? { ...s, ...updatedSection } : s));
            }
          } else {
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
