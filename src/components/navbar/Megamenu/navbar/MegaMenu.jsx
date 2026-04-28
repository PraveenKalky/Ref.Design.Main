import React, { useState, useCallback } from 'react';
import './mega-menu.css';

const MenuItem = ({ label, count, isHovered, isDimmed, onEnter, onLeave }) => (
  <div
    className={`mega-menu__item ${isHovered ? 'mega-menu__item--hovered' : ''} ${isDimmed ? 'mega-menu__item--dimmed' : ''}`}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  >
    {label}<sup className="mega-menu__sup">{count}</sup>
  </div>
);

const MegaMenu = ({ visible, leftItems = [], rightItems = [], onMouseEnter, onMouseLeave }) => {
  const [hoveredLabel, setHoveredLabel] = useState(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });

  const anyHovered = hoveredLabel !== null;

  const handleEnter = useCallback((label, e) => {
    setHoveredLabel(label);
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPos({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredLabel(null);
  }, []);

  return (
    <div
      className={`mega-menu ${visible ? 'mega-menu--visible' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mega-menu__inner">
        {/* Left column */}
        <div className="mega-menu__col">
          {leftItems.map(({ label, count }) => (
            <MenuItem
              key={label}
              label={label}
              count={count}
              isHovered={hoveredLabel === label}
              isDimmed={anyHovered && hoveredLabel !== label}
              onEnter={(e) => handleEnter(label, e)}
              onLeave={handleLeave}
            />
          ))}
        </div>

        {/* Right column */}
        <div className="mega-menu__col">
          {rightItems.map(({ label, count }) => (
            <MenuItem
              key={label}
              label={label}
              count={count}
              isHovered={hoveredLabel === label}
              isDimmed={anyHovered && hoveredLabel !== label}
              onEnter={(e) => handleEnter(label, e)}
              onLeave={handleLeave}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
