import React from 'react';
import HeroContent from './HeroContent';
import './hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <HeroContent />
      </div>
    </section>
  );
};

export default Hero;
