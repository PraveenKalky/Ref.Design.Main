import React, { useState } from 'react';
import { Bookmark, Download, SlidersHorizontal, ChevronDown } from 'lucide-react';
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

const FILTER_GROUPS = [
  {
    label: 'Categories',
    key: 'categories',
    options: ['Serif', 'Sans-Serif', 'Script and Handwritten', 'Decorative'],
  },
  {
    label: 'Spacing',
    key: 'spacing',
    options: ['Normal', 'Monospace', 'Condensed', 'Expanded'],
  },
  {
    label: 'Optimum Size',
    key: 'size',
    options: ['Large (Display / Poster)', 'Small (Book / Magazine)', 'Condensed', 'Any Size'],
  },
  {
    label: 'Properties',
    key: 'properties',
    options: ['Web Font'],
  },
];

const Fonts = () => {
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [checked, setChecked] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  const toggleCheck = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fonts-page">

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

          {/* Top bar */}
          <div className="fonts-topbar">
            <button
              className="fonts-toggle-btn"
              onClick={() => setFiltersVisible(v => !v)}
            >
              <SlidersHorizontal size={16} strokeWidth={2} />
              <span>{filtersVisible ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            <div className="fonts-sort">
              <span>Sort by</span>
              <button className="fonts-sort-btn">
                Popular <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <div className="fonts-topbar-divider" />

          {/* Two-panel layout */}
          <div className="fonts-body">

            {/* LEFT SIDEBAR */}
            <aside className={`fonts-sidebar ${filtersVisible ? 'is-visible' : 'is-hidden'}`}>
              {FILTER_GROUPS.map(group => (
                <div className="flt-group" key={group.key}>
                  <p className="flt-group-label">{group.label}</p>
                  <div className="flt-group-divider" />
                  {group.options.map(opt => {
                    const id = `${group.key}-${opt}`;
                    return (
                      <label className="flt-check-row" key={id} htmlFor={id}>
                        <input
                          id={id}
                          type="checkbox"
                          className="flt-checkbox"
                          checked={!!checked[id]}
                          onChange={() => toggleCheck(id)}
                        />
                        <span className="flt-check-label">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </aside>

            {/* RIGHT — CARDS GRID */}
            <div className="fonts-cards-wrap">
              <div className="fonts-grid">
                {FONT_CARDS.map(card => (
                  <div
                    key={card.id}
                    className="font-card"
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

                    {/* Hover actions */}
                    <div className={`font-card-actions ${hoveredCard === card.id ? 'is-visible' : ''}`}>
                      <button className="font-card-btn" aria-label="Save">
                        <Bookmark size={15} strokeWidth={2} />
                      </button>
                      <button className="font-card-btn" aria-label="Download">
                        <Download size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Fonts;
