import React, { useState } from 'react';
import { Bookmark, Download, ChevronDown, Type, RotateCcw, ArrowUpRight } from 'lucide-react';
import '../components/card-grid/card-grid.css';
import './Fonts.css';

const FONT_CARDS = [
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
];

const Fonts = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

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
        <section className="fonts-gallery-section">
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
              {FONT_CARDS.map(card => (
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

          </div>
        </section>
      </div>
    </div>
  );
};

export default Fonts;
