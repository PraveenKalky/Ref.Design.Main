import React from 'react';
import HeroContent from './HeroContent';
import HeroPreview from './HeroPreview';
import './hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <HeroContent />
      <HeroPreview />
    </section>
  );
};

export default Hero;
