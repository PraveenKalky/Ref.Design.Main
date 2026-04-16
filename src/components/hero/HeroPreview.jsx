import React from 'react';
import heroImage from '../../assets/hero-preview.png';

const HeroPreview = () => {
  return (
    <div className="hero-preview">
      <img 
        src={heroImage} 
        alt="Ref.Design Platform Preview" 
        className="hero-preview-img"
      />
    </div>
  );
};

export default HeroPreview;
