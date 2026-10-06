import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import './UITasteHero.css';

/**
 * UITasteHero:
 * Renders an immersive, concave 3D perspective thumbnail ribbon
 * matching the visual reference (Melius), tailored for Ref.Design UI/UX Tastes.
 *
 * Uses REAL dynamic thumbnails from the UI/UX Tastes Supabase database.
 * Computes dynamic 3D transforms (scale & rotateY) so cards naturally bend
 * into distance toward screen center and flare large at the edges.
 */
export default function UITasteHero({ posts = [], children }) {
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const reqIdRef = useRef(null);
  const scrollPosRef = useRef(0);
  const isPausedRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Filter posts that have valid images to populate the dynamic ribbon
  const validPosts = useMemo(() => {
    const list = posts.filter(
      p => p.media_url && !p.media_url.includes('photo-1618761714954-0b8cd0026356')
    );
    if (list.length === 0) return [];
    
    // Duplicate items if needed to guarantee a lush ribbon of cards
    let doubled = [...list];
    while (doubled.length < 12 && doubled.length > 0) {
      doubled = [...doubled, ...list];
    }
    return doubled.slice(0, 18);
  }, [posts]);

  // Combined array for seamless looping (A + B)
  const displayPosts = useMemo(() => {
    if (validPosts.length === 0) return [];
    return [...validPosts, ...validPosts];
  }, [validPosts]);

  // Smooth mouse parallax tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      setMouseOffset({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update dynamic 3D perspective transforms per card based on distance from viewport center
  const updateCardTransforms = useCallback(() => {
    if (!stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const centerX = stageRect.left + stageRect.width / 2;
    const halfWidth = stageRect.width / 2 || window.innerWidth / 2;

    const cards = stageRef.current.querySelectorAll('.ui-taste-ribbon-card');
    cards.forEach((card) => {
      if (card.matches(':hover')) return; // let hover CSS take over

      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distFromCenter = (cardCenter - centerX) / halfWidth; // -1 to 1
      const clampedDist = Math.max(-1.3, Math.min(1.3, distFromCenter));
      const absDist = Math.abs(clampedDist);

      // Concave scale curve: 0.72x in center -> 1.35x at edges
      const scale = 0.72 + Math.pow(absDist, 1.3) * 0.63;
      // 3D rotation inward facing center: left cards rotate positive/right, right cards rotate negative/left
      const rotateY = -clampedDist * 26;
      // Slight Z-pushback in center for depth
      const translateZ = (1 - absDist) * -120;
      // Vertical gentle parabolic arc sag in center
      const translateY = (1 - absDist) * 12;

      card.style.transform = `translate3d(0, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
    });
  }, []);

  // Animation frame loop for continuous silky infinite scroll
  useEffect(() => {
    if (displayPosts.length === 0) return;

    const speed = 0.75; // pixels per frame
    const animate = () => {
      if (!isPausedRef.current && trackRef.current) {
        scrollPosRef.current += speed;
        const halfScroll = trackRef.current.scrollWidth / 2;
        if (scrollPosRef.current >= halfScroll) {
          scrollPosRef.current -= halfScroll;
        }
        trackRef.current.style.transform = `translate3d(${-scrollPosRef.current}px, 0, 0)`;
        updateCardTransforms();
      }
      reqIdRef.current = requestAnimationFrame(animate);
    };

    reqIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [displayPosts.length, updateCardTransforms]);

  const handleMouseEnter = () => {
    isPausedRef.current = true;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    isPausedRef.current = false;
    setIsHovered(false);
  };

  const getProxiedImage = (url) => {
    if (!url) return '';
    if (url.startsWith('/') || url.startsWith('data:')) return url;
    if (url.includes('?proxy=')) return url;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ciquazqdnbwsxuomdmci.supabase.co';
    return `${supabaseUrl}/functions/v1/telegram-bot?proxy=${encodeURIComponent(url)}`;
  };

  return (
    <section className="ui-taste-hero">
      {/* Ambient background depth glow */}
      <div className="ui-taste-hero-ambient" />

      {/* Top Typography Headline - Echoing the reference */}
      <div className="ui-taste-hero-header">
        <h1 className="ui-taste-hero-title">
          <span>One standard.</span>
          <span>Every UI/UX inspiration.</span>
        </h1>
      </div>

      {/* 3D Curved Perspective Ribbon Stage */}
      <div 
        ref={stageRef}
        className={`ui-taste-hero-ribbon-stage ${isHovered ? 'is-paused' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${mouseOffset.y * -3}deg) rotateY(${mouseOffset.x * 3.5}deg)`
        }}
      >
        <div ref={trackRef} className="ui-taste-hero-ribbon-track">
          {displayPosts.map((post, idx) => (
            <RibbonCard 
              key={`card-${post.id}-${idx}`} 
              post={post} 
              getProxiedImage={getProxiedImage}
            />
          ))}
        </div>
      </div>

      {/* Subtitle & Submission Bar Area */}
      <div className="ui-taste-hero-bottom">
        <p className="ui-taste-hero-subtitle">
          Curated digital craft from the best designers on Dribbble, Behance, X, and Instagram.
        </p>

        {/* Existing Paste URL + Category + Add Post component */}
        <div className="ui-taste-hero-input-anchor">
          {children}
        </div>
      </div>
    </section>
  );
}

function RibbonCard({ post, getProxiedImage }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className="ui-taste-ribbon-card"
      data-platform={post.platform || 'web'}
      onClick={() => {
        if (post.url) {
          window.open(post.url, '_blank', 'noopener,noreferrer');
        }
      }}
      title={post.description || `${post.platform} UI/UX inspiration`}
    >
      <div className="ui-taste-ribbon-card-inner">
        {!hasError ? (
          <img
            src={getProxiedImage(post.media_url)}
            alt={post.description || 'UI Reference'}
            className={`ui-taste-ribbon-img ${imgLoaded ? 'loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
          />
        ) : (
          <div className="ui-taste-ribbon-placeholder">
            <span>{post.platform ? post.platform.slice(0, 2).toUpperCase() : 'UI'}</span>
          </div>
        )}

        <div className="ui-taste-ribbon-glass-overlay">
          <span className="ui-taste-ribbon-badge">{post.platform || 'UI/UX'}</span>
        </div>
      </div>
    </div>
  );
}
