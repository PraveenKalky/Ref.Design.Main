import React, { useState, useRef, useEffect } from 'react';
import { BookmarkSimple, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import './font-details.css';

const RIGHT_GROTESK_IMAGES = [
  { src: '/images/specimens/right-grotesk-font-family-1.webp', alt: 'Condensed headline specimen' },
  { src: '/images/specimens/right-grotesk-font-family-2.webp', alt: 'Multilingual specimen' },
  { src: '/images/specimens/right-grotesk-font-family-3.webp', alt: 'Weight & style matrix' },
  { src: '/images/specimens/right-grotesk-font-family-4.webp', alt: 'Many Bigger Things specimen' },
  { src: '/images/specimens/right-grotesk-font-family.webp', alt: 'Right Grotesk overview specimen' }
];

const RightGroteskSlides = () => {
  const tripleImages = [...RIGHT_GROTESK_IMAGES, ...RIGHT_GROTESK_IMAGES, ...RIGHT_GROTESK_IMAGES];
  
  return (
    <>
      {tripleImages.map((img, idx) => (
        <div key={idx} className="carousel-slide" style={{ padding: 0 }}>
          <img 
            src={img.src} 
            alt={img.alt} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          />
        </div>
      ))}
    </>
  );
};


const FontDetailsHero = ({ font }) => {
  const isRightGrotesk = font?.name === 'Right Grotesk' || true; // Apply to Right Grotesk

  const trackRef = useRef(null);
  const scrollTimeout = useRef(null);
  const isInitialized = useRef(false);

  const checkScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      
      const cardWidth = 948;
      const gap = 24; 
      const scrollAmount = cardWidth + gap; // 972
      const N = RIGHT_GROTESK_IMAGES.length; // 5
      
      const currentIndex = Math.round(track.scrollLeft / scrollAmount);
      
      if (currentIndex < N) {
        // Jump forward to the middle set
        track.style.setProperty('scroll-behavior', 'auto', 'important');
        track.scrollLeft += N * scrollAmount;
        void track.offsetHeight; // force reflow
        track.style.removeProperty('scroll-behavior');
      } else if (currentIndex >= N * 2) {
        // Jump backward to the middle set
        track.style.setProperty('scroll-behavior', 'auto', 'important');
        track.scrollLeft -= N * scrollAmount;
        void track.offsetHeight; // force reflow
        track.style.removeProperty('scroll-behavior');
      }
    }, 150); // wait for snapping/smooth scroll to completely stop
  };

  useEffect(() => {
    const track = trackRef.current;
    if (track && !isInitialized.current) {
      // Set initial scroll to the start of the middle clone set (index 5)
      const scrollAmount = 948 + 24;
      track.style.setProperty('scroll-behavior', 'auto', 'important');
      track.scrollLeft = scrollAmount * RIGHT_GROTESK_IMAGES.length;
      void track.offsetHeight;
      track.style.removeProperty('scroll-behavior');
      isInitialized.current = true;
    }

    track?.addEventListener('scroll', checkScroll);
    return () => track?.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollByCard = (direction) => {
    if (trackRef.current) {
      const scrollAmount = 948 + 24;
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!isRightGrotesk) {
    const backgroundImageUrl = "/images/hero-bg.jpg";
    return (
      <section className="font-details-hero" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 
            className="hero-font-name" 
            style={{ fontFamily: font?.googleFont || 'inherit', fontSize: '140px', color: '#ffffff' }}
          >
            {font?.name || 'Font Name'}
          </h1>
          <p className="hero-font-about">{font?.description || ''}</p>
          
          <div className="hero-specs-container">
            <div className="hero-spec-item">
              <span className="hero-spec-label">Weights & Styles</span>
              <span className="hero-spec-value">{font?.weightsAndStyles}</span>
            </div>
            <div className="hero-spec-item">
              <span className="hero-spec-label">Language Support</span>
              <span className="hero-spec-value">{font?.languageSupport}</span>
            </div>
            <div className="hero-spec-item">
              <span className="hero-spec-label">Release Year</span>
              <span className="hero-spec-value">{font?.releaseYear}</span>
            </div>
          </div>
        </div>
        
        <div className="hero-bottom-nav-container">
          <nav className="hero-pill-nav">
            <a href="#styles" className="nav-item">Styles</a>
            <a href="#specimen" className="nav-item">Specimen</a>
            <a href="#information" className="nav-item">Information</a>
            <a href="#glyphs" className="nav-item">Glyphs</a>
          </nav>
          <button className="hero-save-btn">
            <BookmarkSimple size={18} weight="regular" />
          </button>
          <button className="hero-download-btn">
            <span>DOWNLOAD</span>
            <ArrowRight className="hero-download-icon" size={20} weight="bold" />
          </button>
        </div>
      </section>
    );
  }

  // Right Grotesk Carousel Hero
  return (
    <>
      <div className="rg-breadcrumb-wrapper">
        <div className="rg-breadcrumb-action-bar">
        <div className="rg-breadcrumb">
          <span className="crumb">Home</span>
          <span className="separator">/</span>
          <span className="crumb">Fonts</span>
          <span className="separator">/</span>
          <span className="crumb">Sans Serif</span>
          <span className="separator">/</span>
          <span className="crumb current">{font?.name}</span>
        </div>
        
        <nav className="hero-text-nav">
          <a href="#styles" className="nav-item hover-opt11">
            <span className="txt-wrap" data-text="Styles">Styles</span>
          </a>
          <a href="#specimen" className="nav-item hover-opt11">
            <span className="txt-wrap" data-text="Specimen">Specimen</span>
          </a>
          <a href="#information" className="nav-item hover-opt11">
            <span className="txt-wrap" data-text="Information">Information</span>
          </a>
          <a href="#glyphs" className="nav-item hover-opt11">
            <span className="txt-wrap" data-text="Glyphs">Glyphs</span>
          </a>
        </nav>
        <div className="hero-buttons-group">
          <button className="hero-save-btn hover-opt11">
            <span className="txt-wrap" data-text="Save">Save</span>
          </button>
          <button className="hero-download-btn hover-opt11">
            <span className="txt-wrap" data-text="Download">Download</span>
          </button>
        </div>
      </div>
      </div>

      <section className="font-intro-section">
        <div className="font-intro-container">
          <h1 className="font-intro-title">{font?.name}</h1>
          <p className="font-intro-description">
            {font?.description || `${font?.name} is a striking sans serif font family designed by Nikola Kostić. It features forty-five distinct styles, offering immense versatility for modern digital design. Published by Kostic Type Foundry, this premium typeface strikes a perfect balance between legibility and character.`}
          </p>
        </div>
      </section>

      <section className="font-details-hero carousel-layout">
        
        {/* Carousel Area */}
        <div className="carousel-viewport">
        <div 
          className="carousel-track" 
          ref={trackRef} 
          onScroll={checkScroll}
        >
          {/* Spacer to push first item to center if needed, or we use padding */}
          <RightGroteskSlides font={font} />
        </div>

        {/* Navigation Arrows */}
        <button 
          className="carousel-nav-btn prev" 
          onClick={() => scrollByCard('left')}
          aria-label="Previous Slide"
        >
          <ArrowLeft size={24} weight="regular" color="#111" />
        </button>
        
        <button 
          className="carousel-nav-btn next" 
          onClick={() => scrollByCard('right')}
          aria-label="Next Slide"
        >
          <ArrowRight size={24} weight="regular" color="#111" />
        </button>
      </div>

      </section>
    </>
  );
};

export default FontDetailsHero;
