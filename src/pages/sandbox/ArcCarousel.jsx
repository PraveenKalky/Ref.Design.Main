import React, { useEffect, useRef } from 'react';
import './arc-carousel.css';
import HeroContent from '../../components/hero/HeroContent';
import '../../components/hero/hero.css';

const baseImages = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2787&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005192384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
];

// Quintuple the array to provide ultra-high density of cards (35 total cards)
const images = [...baseImages, ...baseImages, ...baseImages, ...baseImages, ...baseImages];

const ArcCarousel = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const offsetRef = useRef(0);
  const isHoveredRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    document.title = "Design Vault - Arc Carousel Sandbox";

    const numCards = images.length;
    const spacing = 14; // Ultra-tight degrees spacing (approx 12-16px gap)
    const wrapLimit = numCards * spacing;
    const halfWrap = wrapLimit / 2;
    const speed = 0.15; // degrees per frame

    const updateCards = () => {
      if (!isHoveredRef.current) {
        offsetRef.current -= speed;
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        // Calculate raw angle, then wrap it seamlessly
        let rawAngle = (i * spacing + offsetRef.current) % wrapLimit;
        // Handle negative modulo correctly
        if (rawAngle < 0) rawAngle += wrapLimit;

        const angle = rawAngle - halfWrap;
        const absAngle = Math.abs(angle);

        // Opacity: fade out completely at edges so the wrap jump is invisible
        // Visible up to 60deg, fades to 0 by 85deg (halfWrap is 112)
        const opacity = Math.max(0, 1 - (absAngle > 60 ? (absAngle - 60) / 25 : 0));

        // Scale: Center is 1, edges shrink slightly
        const scale = Math.max(0.7, 1 - (absAngle / 300));

        // z-index: Center card must be on top
        const zIndex = Math.round(100 - absAngle);

        // Mobile adjustment logic based on window width
        const isMobile = window.innerWidth <= 768;
        const radius = isMobile ? -250 : -400;

        // Directly manipulate DOM for 60fps
        card.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(${radius}px) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;
      });

      rafRef.current = requestAnimationFrame(updateCards);
    };

    rafRef.current = requestAnimationFrame(updateCards);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="sandbox-arc-wrapper">
      <div
        className="sandbox-carousel-container"
        ref={containerRef}
        onMouseEnter={() => (isHoveredRef.current = true)}
        onMouseLeave={() => (isHoveredRef.current = false)}
      >
        <div className="sandbox-center-content">
          <HeroContent />
        </div>

        {images.map((src, idx) => (
          <div
            key={idx}
            className="sandbox-arc-card"
            ref={(el) => (cardsRef.current[idx] = el)}
          >
            <img src={src} alt={`Abstract ${idx + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArcCarousel;
