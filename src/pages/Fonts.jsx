import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, X, Type, RotateCcw, LayoutGrid, Menu, Maximize2, MoveHorizontal } from 'lucide-react';
import { DownloadSimple, BookmarkSimple, FadersHorizontal, CaretUpDown, SquaresFour, List } from '@phosphor-icons/react';
import Pagination from '../components/pagination/Pagination';
import LoginModal from '../components/navbar/LoginModal';
import AaPathPreview from '../components/font-preview/AaPathPreview';
import '../components/filter-bar/filter-bar.css';
import '../components/filters/category-filter-expanded.css';
import './Fonts.css';
import { useNavigate } from 'react-router-dom';
import { FONT_CATEGORY_COUNTS, initialFontsData } from '../data/fontsData';
import { useFonts } from '../hooks/useFonts';
import { useSavedFonts } from '../hooks/useSavedFonts';

const getShortDescription = (fontName) => {
  const descriptions = {
    "Neue Montreal": "The only Grotesk you'll ever need.",
    "PP Fragment": "Classic serifs with a contemporary twist.",
    "Right Grotesk": "Neutral, but not boring.",
    "Mori": "A versatile gothic sans-serif.",
    "Pangram Sans": "A comprehensive geometric sans-serif workhorse.",
    "Formula": "A bold, flexible grotesk for maximum impact.",
    "Editorial New": "Precise, narrow serif for fashion and headlines.",
    "Telegraph": "A sturdy, functional sans-serif for branding."
  };
  const baseName = fontName.replace(/\s\d+$/, '');
  return descriptions[baseName] || descriptions[fontName] || "A premium high-quality typeface.";
};

const HOVER_SENTENCES = [
  "We promptly judged antique ivory buckles for the next prize.",
  "Jim quickly realized that the beautiful gowns are expensive.",
  "The cajoling quirked sexy wizard mob persuade very influentially.",
  "A quivering Texas zombie fought republic linked jewelry.",
  "The five boxing wizards jump quickly from Bronx cafes to dazzling Queens nightclubs.",
  "Jackie will budget for the most expensive zoology equipment."
];
const PREVIEW_COLORS = [
  { id: 'white', value: '#ffffff', border: '#111111', isDarkBg: false },
  { id: 'black', value: '#111111', border: '#111111', isDarkBg: true },
  { id: 'orange', value: '#e4572e', border: '#111111', isDarkBg: false },
  { id: 'yellow', value: '#f2b544', border: '#111111', isDarkBg: false },
];


// Google fonts that render ONLY uppercase — lowercase chars display as caps
// These need uppercase-only scramble chars so width profile matches final text
const ALL_CAPS_FONTS = [
  'Bebas Neue',       // Formula
  'Big Shoulders Display',
  'Alfa Slab One',
];

const isAllCapsFont = (googleFont = '') =>
  ALL_CAPS_FONTS.some(f => googleFont.includes(f));

// Scramble char sets — letter-only to keep width variance low
const SCRAMBLE_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SCRAMBLE_MIXED = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const ScrambleText = ({ text, active, uppercase }) => {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef(null);
  const iterRef = useRef(0);
  // Use uppercase-only chars for all-caps fonts so scramble width ≈ final text width
  const CHARS = uppercase ? SCRAMBLE_UPPER : SCRAMBLE_MIXED;

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    iterRef.current = 0;

    if (!active) {
      setDisplay(text);
      return;
    }

    const TOTAL_FRAMES = 22;
    const resolvePerFrame = text.length / TOTAL_FRAMES;

    const step = () => {
      iterRef.current += resolvePerFrame;
      const resolvedCount = Math.floor(iterRef.current);

      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ' || char === '\n') return char; // preserve spaces → stable line breaks
            if (i < resolvedCount) return text[i];           // resolved: show real char
            return CHARS[Math.floor(Math.random() * CHARS.length)]; // scramble
          })
          .join('')
      );

      if (resolvedCount < text.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(text); // exact final text guaranteed
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, text]);

  return <>{display}</>;
};

const FontCard = ({ font, globalText, globalFontSize, viewMode, savedIds, toggleSave, openLogin }) => {
  const [fontSize, setFontSize] = useState(globalFontSize || 120);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const defaultFontSize = globalFontSize || 120;
  const defaultLineHeight = 1.2;
  const defaultLetterSpacing = 0;
  const [isHovered, setIsHovered] = useState(false);
  const [autoFontSize, setAutoFontSize] = useState(null);
  const [activeSwatch, setActiveSwatch] = useState(null);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const previewSpanRef = useRef(null);
  const previewContainerRef = useRef(null);
  const styleDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Build style list from font data
  const fontStyles = font?.stylesList?.length
    ? font.stylesList
    : [{ name: 'Regular', weight: 400, italic: false }];
  const selectedStyle = fontStyles[selectedStyleIndex] || fontStyles[0];

  useEffect(() => {
    if (globalFontSize !== undefined) {
      setFontSize(globalFontSize);
    }
  }, [globalFontSize]);

  // Close style dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(e.target)) {
        setStyleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isGrid = viewMode === 'grid';
  const SPECIMEN_TEXT = "AaBbCcDdEeFfGgHhIiJjKkLlMm";
  const hoverSentence = HOVER_SENTENCES[(font.id - 1) % HOVER_SENTENCES.length];
  
  const textToShow = globalText && globalText.trim() !== '' 
    ? globalText 
    : SPECIMEN_TEXT;

  // Detect all-caps fonts — they render every char as uppercase
  const allCaps = isAllCapsFont(font.googleFont);

  const hoverTextToShow = (() => {
    const raw = globalText && globalText.trim() !== ''
      ? globalText
      : (isGrid ? 'Aa' : hoverSentence);
    // All-caps fonts: uppercase the text so width profile matches scramble chars
    return allCaps ? raw.toUpperCase() : raw;
  })();

  // Start large and shrink until text fits the container width
  const MAX_SIZE = isGrid ? 148 : 180;
  const MIN_SIZE = isGrid ? 40 : 20;

  useEffect(() => {
    const span = previewSpanRef.current;
    const container = previewContainerRef.current;
    if (!span || !container) return;

    const fit = () => {
      // Force nowrap so width measurement is accurate
      span.style.whiteSpace = 'nowrap';
      span.style.lineHeight = '1';

      let size = MAX_SIZE;
      span.style.fontSize = size + 'px';

      // Shrink by 2px steps until both width AND height fit
      while (
        size > MIN_SIZE &&
        (span.scrollWidth > container.offsetWidth ||
         span.offsetHeight > container.offsetHeight)
      ) {
        size -= 2;
        span.style.fontSize = size + 'px';
      }
      // Fine-tune by 1px
      while (
        size > MIN_SIZE &&
        (span.scrollWidth > container.offsetWidth ||
         span.offsetHeight > container.offsetHeight)
      ) {
        size -= 1;
        span.style.fontSize = size + 'px';
      }

      setAutoFontSize(size);
    };

    // Initial fit
    fit();
    // Re-run after web fonts load (300ms grace)
    const timer = setTimeout(fit, 350);

    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textToShow, isGrid]);

  // Sync the hover text size and slider with the auto-fitted size when typing custom text
  useEffect(() => {
    if (globalText && globalText.trim() !== '') {
      if (autoFontSize) setFontSize(autoFontSize);
    } else {
      setFontSize(globalFontSize || 120);
    }
  }, [globalText, autoFontSize, globalFontSize]);

  const handleCardClick = (e) => {
    // Prevent navigation if the user is interacting with sliders or buttons
    if (e.target.closest('.font-card-hover-controls') || e.target.closest('button')) {
      return;
    }
    navigate(`/fonts/${font.id}`);
  };

  return (
    <div 
      className={`font-card${activeSwatch ? (activeSwatch.isDarkBg ? ' swatch-dark-bg' : ' swatch-light-bg') : ''}${styleDropdownOpen ? ' dropdown-open' : ''}`} 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        cursor: 'pointer', 
        '--swatch-color': activeSwatch?.value 
      }}
    >
      {/* ── ROW 1: Meta row — always visible, never moves ── */}
      <div className="font-card-top">
        <div className="card-top-left">
          <div className="font-name-wrap">
            <h3 className="font-card-name">{font.name}</h3>
            {font.badge && (
              <span className={`font-badge ${font.badge.toLowerCase()}`}>
                {font.badge}
              </span>
            )}
          </div>
          {viewMode === 'grid' && font.stylesInfo && (
            <div className="font-card-styles-info">
              {font.stylesInfo.split('\n').slice(0, 2).map((line, idx) => (
                <div key={idx} className="metadata-line">{line}</div>
              ))}
            </div>
          )}
        </div>

        <div className="card-top-center">
          <p className="font-card-desc">{getShortDescription(font.name)}</p>
          {viewMode === 'list' && (
            <div className="fchc-bar">
              {/* 1. Style dropdown */}
              <div className="fchc-pill fchc-select" ref={styleDropdownRef} style={{ position: 'relative' }}
                onClick={(e) => { e.stopPropagation(); setStyleDropdownOpen(prev => !prev); }}
              >
                <span className="fchc-select-text">{selectedStyle.name}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  style={{ transform: styleDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}
                />
                {styleDropdownOpen && (
                  <div className="fchc-style-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    {fontStyles.map((style, idx) => (
                      <button
                        key={idx}
                        className={`fchc-style-dropdown-item${idx === selectedStyleIndex ? ' is-selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStyleIndex(idx);
                          setStyleDropdownOpen(false);
                        }}
                        style={{ fontWeight: style.weight, fontStyle: style.italic ? 'italic' : 'normal' }}
                      >
                        <span>{style.name}</span>
                        <span className="fchc-style-dropdown-weight">{style.weight}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Font size */}
              <div className="fchc-pill fchc-control">
                <span className="fchc-label">Size</span>
                <div className="fchc-slider-wrapper">
                  <input
                    type="range"
                    min="24"
                    max="200"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="fchc-slider"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div 
                    className="fchc-slider-default-marker"
                    style={{ left: 'calc(5px + (100% - 10px) * 0.22727)' }}
                  />
                </div>
                <span className="fchc-value">{fontSize}</span>
                {fontSize !== defaultFontSize && (
                  <button
                    className="fchc-reset-btn"
                    onClick={(e) => { e.stopPropagation(); setFontSize(defaultFontSize); }}
                    title="Reset size"
                  >
                    <RotateCcw size={12} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* 3. Leading (Line Height) */}
              <div className="fchc-pill fchc-control">
                <span className="fchc-label">Leading</span>
                <div className="fchc-slider-wrapper">
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.05"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="fchc-slider"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div 
                    className="fchc-slider-default-marker"
                    style={{ left: 'calc(5px + (100% - 10px) * 0.23529)' }}
                  />
                </div>
                <span className="fchc-value">{parseFloat(lineHeight).toFixed(2)}</span>
                {lineHeight !== defaultLineHeight && (
                  <button
                    className="fchc-reset-btn"
                    onClick={(e) => { e.stopPropagation(); setLineHeight(defaultLineHeight); }}
                    title="Reset leading"
                  >
                    <RotateCcw size={12} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* 4. Tracking */}
              <div className="fchc-pill fchc-control">
                <span className="fchc-label">Spacing</span>
                <div className="fchc-slider-wrapper">
                  <input
                    type="range"
                    min="-0.5"
                    max="0.5"
                    step="0.01"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(Number(e.target.value))}
                    className="fchc-slider"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div 
                    className="fchc-slider-default-marker"
                    style={{ left: 'calc(5px + (100% - 10px) * 0.5)' }}
                  />
                </div>
                <span className="fchc-value">{parseFloat(letterSpacing).toFixed(2)}</span>
                {letterSpacing !== defaultLetterSpacing && (
                  <button
                    className="fchc-reset-btn"
                    onClick={(e) => { e.stopPropagation(); setLetterSpacing(defaultLetterSpacing); }}
                    title="Reset spacing"
                  >
                    <RotateCcw size={12} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {viewMode === 'list' && font.stylesInfo && (
          <div className="card-top-metadata">
            {font.stylesInfo.replace(/\s*[+\n]\s*/g, ' • ')}
          </div>
        )}

        <div className="card-top-right">

          <button className="font-card-action-btn icon-only" title="Download">
            <DownloadSimple size={16} weight="bold" />
            <span className="btn-text">Download</span>
          </button>
          <button
            className={`font-card-action-btn icon-only font-card-save-btn${savedIds?.[font.id] ? ' saved' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleSave?.(font.id); }}
            title={savedIds?.[font.id] ? 'Unsave' : 'Save'}
          >
            <BookmarkSimple size={16} weight={savedIds?.[font.id] ? "fill" : "bold"} />
            <span className="btn-text">{savedIds?.[font.id] ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* ── ROW 2: Preview area ── */}
      <div className="font-card-preview" ref={previewContainerRef}>
        <span
          className="preview-default"
          style={{
            fontFamily: font.googleFont,
            fontWeight: selectedStyle.weight,
            fontStyle: selectedStyle.italic ? 'italic' : 'normal',
          }}
        >
          {viewMode === 'grid' && (!globalText || globalText.trim() === '') ? (
            /* AaPathPreview uses opentype.js to extract glyph outlines.
               Output is a real SVG <path> — no <text> node, no Typography
               panel in Figma, pure vector shapes that scale cleanly. */
            <AaPathPreview
              googleFont={font.googleFont}
              weight={selectedStyle.weight}
              italic={selectedStyle.italic}
              color="currentColor"
              width={238}
              height={152}
              ariaLabel={`${font.name} Aa preview`}
            />
          ) : (
            <span
              ref={previewSpanRef}
              style={{
                fontSize: autoFontSize ? `${autoFontSize}px` : `${MAX_SIZE}px`,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
            >
              {viewMode === 'grid' ? globalText : textToShow}
            </span>
          )}
        </span>
        <span className="preview-hover" style={{ 
          fontSize: `${fontSize}px`, 
          letterSpacing: `${letterSpacing}em`, 
          fontFamily: font.googleFont,
          fontWeight: selectedStyle.weight,
          fontStyle: selectedStyle.italic ? 'italic' : 'normal',
        }}>
          <span className="preview-hover-inner" style={{ lineHeight: lineHeight }}>
            {viewMode === 'grid' && (!globalText || globalText.trim() === '')
              ? "Aa"
              : <ScrambleText text={hoverTextToShow} active={isHovered} uppercase={allCaps} />
            }
          </span>
        </span>
      </div>
    </div>
  );
};

// No massive dummy array needed in memory!
// We'll dynamically generate exactly the 32 cards needed per page.

const ITEMS_PER_PAGE = 32;

const PRESET_TEXTS = [
  "Almost before we know it, we had left the ground.",
  "The quick brown fox jumps over the lazy dog.",
  "When zombies arrive, quickly fax judge Pat.",
  "Crazy Fredericka bought many very exquisite opal jewels.",
  "Voix ambiguë d'un cœur qui au zéphyr préfère les jattes..."
];

const FONT_CATEGORIES = Object.keys(FONT_CATEGORY_COUNTS);

const Fonts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const galleryRef = useRef(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // ── Data from Supabase ──
  const { fonts: dbFonts, loading: fontsLoading } = useFonts();

  // ── Saved fonts (Supabase when logged in, localStorage when not) ──
  const { savedIds, savedCount, toggleSave } = useSavedFonts(() => setIsLoginOpen(true));

  const [activeTab, setActiveTab] = useState('popular');
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);;

  const [globalText, setGlobalText] = useState("");
  const [globalFontSize, setGlobalFontSize] = useState(64);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const dropdownRef = useRef(null);
  
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Most recent first");
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const removeCategoryChip = (cat) => {
    const el = document.getElementById(`font-chip-${cat}`);
    if (el) {
      el.classList.add('chip-exit');
      setTimeout(() => {
        setSelectedCategories(prev => prev.filter(c => c !== cat));
      }, 200);
    } else {
      toggleCategory(cat);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // Use fonts from Supabase (or local fallback while loading)
  const fontsSource = dbFonts.length > 0 ? dbFonts : initialFontsData;
  const safeFontsSource = fontsSource.length > 0 ? fontsSource : initialFontsData;

  // Dynamically compute only the cards for the current page
  const paginatedCards = Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => {
    const globalIndex = startIndex + i;
    const baseFont = safeFontsSource[globalIndex % safeFontsSource.length];
    return {
      ...baseFont,
      id: globalIndex + 1,
      name: globalIndex < safeFontsSource.length
        ? baseFont.name
        : `${baseFont.name} ${Math.floor(globalIndex / safeFontsSource.length) + 1}`
    };
  });

  return (
    <div className="fonts-page">
      <div className="fonts-page-wrapper">
        {/* ── HERO ── */}
        <section className="fonts-hero">
          <div className="fonts-hero-content">
            <h1 className="fonts-heading">
              <span className="dark-text">Every great design starts with <br /> the </span>
              <span className="purple-text">right font</span>
            </h1>
            <p className="fonts-subtext">
              Set your projects apart with exceptional typography. Explore our range of premium fonts,
              from statement text to subtle body copy; we have it all to capture the mood for your project.
            </p>
          </div>
        </section>
      </div>

      {/* ── HERO FILTER PATTERN ── */}
        <div className="filter-bar-container">

          <div className={`filter-categories-wrapper ${isExpanded ? 'expanded' : ''}`}>
              <div className="filter-categories-inner">
                <div className="category-filter-expanded">
                  {/* Row 2: Category Tags */}
                  <div className="cfe-tags-grid">
                    {FONT_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        className={`cfe-tag ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                        onClick={() => toggleCategory(cat)}
                      >
                        {cat}
                        <span className="cfe-tag-count">{FONT_CATEGORY_COUNTS[cat]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Row 3: Active Selection Chips */}
                  {selectedCategories.length > 0 && (
                    <div className="cfe-chips-container">
                      {selectedCategories.map(item => (
                        <div key={item} id={`font-chip-${item}`} className="cfe-chip selected-chip">
                          <span>{item}</span>
                          <button
                            className="cfe-chip-remove"
                            onClick={() => removeCategoryChip(item)}
                            aria-label={`Remove ${item}`}
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>

      <div className="fonts-page-wrapper">
        {/* ── LIST LAYOUT SECTION ── */}
        <section className="fonts-gallery-section" ref={galleryRef}>
          <div className="fonts-gallery-inner">
            
            <div className="font-controls-bar">
              <div className="fcb-left-group">
                <button 
                  className="fcb-action-btn"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <FadersHorizontal size={16} weight="bold" /> Filters
                </button>

                <div className="sort-container" ref={sortDropdownRef}>
                  <button 
                    className="fcb-action-btn fcb-sort sort-trigger"
                    onClick={(e) => { e.stopPropagation(); setIsSortOpen(!isSortOpen); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsSortOpen(false);
                    }}
                    aria-haspopup="listbox" 
                    aria-expanded={isSortOpen}
                  >
                    <span id="sortLabel">{selectedSort}</span> <CaretUpDown size={16} weight="bold" />
                  </button>

                  <div className={`sort-dropdown ${isSortOpen ? 'open' : ''}`} role="listbox">
                    {['Most recent first', 'Most popular first', 'Alphabetical A-Z', 'Alphabetical Z-A'].map((opt) => (
                      <button 
                        key={opt}
                        role="option"
                        aria-selected={selectedSort === opt}
                        className={`sort-option ${selectedSort === opt ? 'selected' : ''}`}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedSort(opt); 
                          setIsSortOpen(false); 
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <span className="top-bar-count">Showing {ITEMS_PER_PAGE} of 3200 fonts</span>
              
              <div className="font-view-toggle">
                <span 
                  className={`toggle-text ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Card view"
                >
                  <SquaresFour size={20} />
                </span>
                <span 
                  className={`toggle-text ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <List size={20} />
                </span>
              </div>
            </div>

            <div className="global-preview-bar">
              <div className="gpb-left" ref={dropdownRef}>
                <input 
                  type="text" 
                  className="gpb-input" 
                  placeholder="Type your text here...."
                  value={globalText}
                  onChange={(e) => setGlobalText(e.target.value)}
                />
                {isDropdownOpen ? (
                  <ChevronUp 
                    className="gpb-chevron" 
                    size={20} 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                ) : (
                  <ChevronDown 
                    className="gpb-chevron" 
                    size={20} 
                    onClick={() => setIsDropdownOpen(true)} 
                  />
                )}

                {isDropdownOpen && (
                  <div className="gpb-dropdown">
                    {PRESET_TEXTS.map((text, i) => (
                      <div 
                        key={i} 
                        className="gpb-dropdown-item"
                        onClick={() => {
                          setGlobalText(text);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div key={currentPage} className={`fonts-cards-container ${viewMode === 'grid' ? 'grid-view' : ''}`}>
              {paginatedCards.map(font => (
                <FontCard
                    key={font.id}
                    font={font}
                    globalText={globalText}
                    globalFontSize={globalFontSize}
                    viewMode={viewMode}
                    savedIds={savedIds}
                    toggleSave={toggleSave}
                    openLogin={() => setIsLoginOpen(true)}
                  />
              ))}
            </div>

            {/* ── PAGINATION ── */}
            <Pagination
              totalItems={3200} // Faking 100 pages (100 * 32 items)

              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      </div>

      {/* Login prompt triggered by Save button when logged out */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default Fonts;
