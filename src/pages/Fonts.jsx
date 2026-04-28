import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, Download, ChevronDown, Type, RotateCcw, ArrowUpRight } from 'lucide-react';
import '../components/card-grid/card-grid.css';
import Pagination from '../components/pagination/Pagination';
import './Fonts.css';

const allFontsData = [
  { id: 1, name: 'Grift',        bg: '#111111', color: '#ffffff', style: 'sans-serif', display: 'Grift.' },
  { id: 2, name: 'Cruel Reality',bg: '#cc1c20', color: '#ffffff', style: 'serif',      display: 'Cruel Reality' },
  { id: 3, name: 'Halfre',       bg: '#111111', color: '#ff3b3b', style: 'sans-serif', display: 'halfre.' },
  { id: 4, name: 'Kalieb',       bg: '#1c0a08', color: '#ffffff', style: 'serif',      display: 'Kalieb' },
  { id: 5, name: 'After',        bg: '#1a2e26', color: '#f4847a', style: 'sans-serif', display: 'After' },
  { id: 6, name: 'Surgena',      bg: '#111111', color: '#ffffff', style: 'sans-serif', display: 'surgena' },
  { id: 7, name: 'Malibu Sunday',bg: '#f5f3ee', color: '#111111', style: 'serif',      display: 'Malibu Sunday' },
  { id: 8, name: 'iBrand',       bg: '#f5f3ee', color: '#111111', style: 'sans-serif', display: 'iBrand.' },
  { id: 9, name: 'Epic Pro',     bg: '#111111', color: '#ffffff', style: 'sans-serif', display: 'EPIC PRO' },
  { id: 10, name: 'Oslla',       bg: '#4355d1', color: '#f5e642', style: 'display',    display: 'OSLLA' },
  { id: 11, name: 'Vogun',       bg: '#f7f0e8', color: '#111111', style: 'serif',      display: 'vogun' },
  { id: 12, name: 'The Youth',   bg: '#1a4575', color: '#e8c98a', style: 'script',     display: 'The Youth' },
  { id: 13, name: 'Aether',      bg: '#0f172a', color: '#38bdf8', style: 'sans-serif', display: 'Aether' },
  { id: 14, name: 'Baskerville', bg: '#fffdfa', color: '#1a1a1a', style: 'serif',      display: 'Baskerville' },
  { id: 15, name: 'Coda',        bg: '#111111', color: '#00ff41', style: 'sans-serif', display: 'CODA' },
  { id: 16, name: 'Dahlia',      bg: '#2d1b2d', color: '#ff9ecd', style: 'serif',      display: 'Dahlia' },
  { id: 17, name: 'Echo',        bg: '#1e293b', color: '#f1f5f9', style: 'sans-serif', display: 'E C H O' },
  { id: 18, name: 'Frost',       bg: '#eff6ff', color: '#1e40af', style: 'serif',      display: 'Frosty' },
  { id: 19, name: 'Giga',        bg: '#000000', color: '#ffffff', style: 'sans-serif', display: 'GIGA' },
  { id: 20, name: 'Helios',      bg: '#fbbf24', color: '#000000', style: 'sans-serif', display: 'HELIOS' },
  { id: 21, name: 'Iris',        bg: '#4c1d95', color: '#ddd6fe', style: 'serif',      display: 'Iris' },
  { id: 22, name: 'Jade',        bg: '#064e3b', color: '#34d399', style: 'sans-serif', display: 'Jade' },
  { id: 23, name: 'Karma',       bg: '#111111', color: '#fb7185', style: 'serif',      display: 'Karma' },
  { id: 24, name: 'Lunar',       bg: '#0f172a', color: '#94a3b8', style: 'sans-serif', display: 'L U N A R' },
  { id: 25, name: 'Mantra',      bg: '#450a0a', color: '#fca5a5', style: 'serif',      display: 'Mantra' },
  { id: 26, name: 'Nova',        bg: '#111111', color: '#ffffff', style: 'sans-serif', display: 'NOVA' },
  { id: 27, name: 'Opal',        bg: '#fdf4ff', color: '#701a75', style: 'serif',      display: 'Opal' },
  { id: 28, name: 'Pulse',       bg: '#000000', color: '#ef4444', style: 'sans-serif', display: 'PULSE' },
  { id: 29, name: 'Quartz',      bg: '#f8fafc', color: '#475569', style: 'serif',      display: 'Quartz' },
  { id: 30, name: 'Rift',        bg: '#111111', color: '#ffffff', style: 'sans-serif', display: 'RIFT' },
  { id: 31, name: 'Siren',       bg: '#1e1b4b', color: '#818cf8', style: 'serif',      display: 'Siren' },
  { id: 32, name: 'Titan',       bg: '#000000', color: '#fbbf24', style: 'sans-serif', display: 'TITAN' },
  { id: 33, name: 'Zenith',      bg: '#020617', color: '#f8fafc', style: 'sans-serif', display: 'ZENITH' },
  { id: 34, name: 'Vortex',      bg: '#1e1b4b', color: '#818cf8', style: 'serif',      display: 'Vortex' },
  { id: 35, name: 'Nebula',      bg: '#000000', color: '#c084fc', style: 'sans-serif', display: 'Nebula' },
  { id: 36, name: 'Quasar',      bg: '#0f172a', color: '#38bdf8', style: 'serif',      display: 'Quasar' },
  { id: 37, name: 'Pulsar',      bg: '#111111', color: '#ffffff', style: 'sans-serif', display: 'PULSAR' },
  { id: 38, name: 'Comet',       bg: '#1e293b', color: '#94a3b8', style: 'serif',      display: 'Comet' },
  { id: 39, name: 'Meteor',      bg: '#450a0a', color: '#fca5a5', style: 'sans-serif', display: 'Meteor' },
  { id: 40, name: 'Galaxy',      bg: '#111111', color: '#ffffff', style: 'serif',      display: 'Galaxy' },
  { id: 41, name: 'Cosmos',      bg: '#0f172a', color: '#38bdf8', style: 'sans-serif', display: 'Cosmos' },
  { id: 42, name: 'Orbit',       bg: '#1e1b4b', color: '#818cf8', style: 'serif',      display: 'Orbit' },
  { id: 43, name: 'Nova II',     bg: '#000000', color: '#ffffff', style: 'sans-serif', display: 'NOVA II' },
  { id: 44, name: 'Eclipse',     bg: '#111111', color: '#ffffff', style: 'serif',      display: 'Eclipse' },
  { id: 45, name: 'Sol',         bg: '#fbbf24', color: '#000000', style: 'sans-serif', display: 'SOL' },
  { id: 46, name: 'Luna',        bg: '#f8fafc', color: '#475569', style: 'serif',      display: 'LUNA' },
  { id: 47, name: 'Mars',        bg: '#ef4444', color: '#ffffff', style: 'sans-serif', display: 'MARS' },
  { id: 48, name: 'Venus',       bg: '#fdf4ff', color: '#701a75', style: 'serif',      display: 'VENUS' },
  { id: 49, name: 'Jupiter',     bg: '#450a0a', color: '#fca5a5', style: 'sans-serif', display: 'JUPITER' },
  { id: 50, name: 'Saturn',      bg: '#fbbf24', color: '#000000', style: 'serif',      display: 'SATURN' },
  { id: 51, name: 'Uranus',      bg: '#eff6ff', color: '#1e40af', style: 'sans-serif', display: 'URANUS' },
  { id: 52, name: 'Neptune',     bg: '#1e1b4b', color: '#818cf8', style: 'serif',      display: 'NEPTUNE' },
  { id: 53, name: 'Pluto',       bg: '#111111', color: '#ffffff', style: 'sans-serif', display: 'PLUTO' },
  { id: 54, name: 'Ceres',       bg: '#f5f3ee', color: '#111111', style: 'serif',      display: 'CERES' },
  { id: 55, name: 'Eris',        bg: '#1a0a08', color: '#ffffff', style: 'sans-serif', display: 'ERIS' },
  { id: 56, name: 'Haumea',      bg: '#ffffff', color: '#000000', style: 'serif',      display: 'HAUMEA' },
  { id: 57, name: 'Makemake',    bg: '#111111', color: '#ff3b3b', style: 'sans-serif', display: 'MAKEMAKE' },
  { id: 58, name: 'Sedna',       bg: '#2d1b2d', color: '#ff9ecd', style: 'serif',      display: 'SEDNA' },
  { id: 59, name: 'Orcus',       bg: '#000000', color: '#ffffff', style: 'sans-serif', display: 'ORCUS' },
  { id: 60, name: 'Quaoar',      bg: '#1e293b', color: '#f1f5f9', style: 'serif',      display: 'QUAOAR' },
  { id: 61, name: 'Gonggong',    bg: '#450a0a', color: '#fca5a5', style: 'sans-serif', display: 'GONGGONG' },
  { id: 62, name: 'Varda',       bg: '#fbbf24', color: '#000000', style: 'serif',      display: 'VARDA' },
  { id: 63, name: 'Ixion',       bg: '#111111', color: '#ffffff', style: 'sans-serif', display: 'IXION' },
  { id: 64, name: 'Varuna',      bg: '#064e3b', color: '#34d399', style: 'serif',      display: 'VARUNA' },
];

const ITEMS_PER_PAGE = 32;

const Fonts = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const galleryRef = useRef(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to gallery section (CSS scroll-margin-top handles the 80px offset)
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Slice cards for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCards = allFontsData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="fonts-page">
      <div className="fonts-page-wrapper">
        {/* ── HERO (untouched) ── */}
        <section className="fonts-hero">
          <div className="fonts-hero-content">
            <div className="fonts-breadcrumb">
              All Items &nbsp;»&nbsp; <span className="current">Fonts</span>
            </div>
            <h1 className="fonts-heading">
              <span className="dark-text">High-Quality </span>
              <span className="purple-text">Fonts</span>
            </h1>
            <p className="fonts-subtext">
              Set your projects apart with exceptional typography. Explore our range of premium fonts,
              from statement text to subtle body copy; we have it all to capture the mood for your project.
            </p>
          </div>
        </section>

        {/* ── GALLERY SECTION ── */}
        <section className="fonts-gallery-section" ref={galleryRef}>
          <div className="fonts-gallery-inner">

            {/* ── NEW HORIZONTAL FILTER BAR ── */}
            <div className="fonts-horizontal-filter-bar">
              <div className="fh-left">
                <button className="fh-pill">Awards <ChevronDown size={12} color="#555" strokeWidth={2.5} /></button>
                <button className="fh-pill">Category <ChevronDown size={12} color="#555" strokeWidth={2.5} /></button>
                <button className="fh-pill">Tag <ChevronDown size={12} color="#555" strokeWidth={2.5} /></button>
                <button className="fh-pill">Technology <ChevronDown size={12} color="#555" strokeWidth={2.5} /></button>
                <button className="fh-pill">Country <ChevronDown size={12} color="#555" strokeWidth={2.5} /></button>
                <button className="fh-pill">
                  Font <ChevronDown size={12} color="#555" strokeWidth={2.5} />
                  <Type size={16} className="fh-icon-type" strokeWidth={2} />
                </button>
                <button className="fh-pill">
                  Color <ChevronDown size={12} color="#555" strokeWidth={2.5} />
                  <div className="fh-color-bars">
                    <div className="fh-bar fh-bar-1"></div>
                    <div className="fh-bar fh-bar-2"></div>
                    <div className="fh-bar fh-bar-3"></div>
                  </div>
                </button>
              </div>
              
              <div className="fh-right">
                <div className="fh-badge">0</div>
                <button className="fh-reset">
                  <span className="fh-reset-text">Reset filters</span>
                  <RotateCcw size={16} color="#555" strokeWidth={2} className="fh-reset-icon" />
                </button>
              </div>
            </div>
            
            <div className="fonts-topbar-divider" />

            {/* ── CARDS GRID ── */}
            <div className="fonts-grid">
              {paginatedCards.map(card => (
                <div
                  key={card.id}
                  className="font-card card-container"
                  style={{ background: card.bg }}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <span
                    className="font-card-name"
                    style={{ color: card.color, fontFamily: card.style === 'script' ? 'Georgia, serif' : card.style === 'serif' ? 'Georgia, Times, serif' : 'inherit' }}
                  >
                    {card.display}
                  </span>

                  {/* Homepage card hover overlay */}
                  <div className="card-overlay">
                    <div className="card-actions">
                      <button className="card-action-btn card-action-open">
                        <ArrowUpRight strokeWidth={2} size={18} /> Open
                      </button>
                      <button className="card-action-btn card-action-save">
                        <Bookmark strokeWidth={2} size={18} /> Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── PAGINATION ── */}
            <Pagination 
              totalItems={allFontsData.length} 
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />

          </div>
        </section>
      </div>
    </div>
  );
};

export default Fonts;
