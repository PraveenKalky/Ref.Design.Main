import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initialFontsData } from '../../data/fontsData';
import FontDetailsHero from './FontDetailsHero';
import FontStylesPreview from './FontStylesPreview';
import FontSpecimen from './FontSpecimen';
import FontSpecimenShowcase from './FontSpecimenShowcase';
import RightGroteskFamilyNav from './RightGroteskFamilyNav';
import GlyphsSection from './GlyphsSection';
import InformationSection from './InformationSection';
import './font-details.css';

const FontDetails = () => {
  const { fontId } = useParams();
  const navigate = useNavigate();
  const [font, setFont] = useState(null);

  useEffect(() => {
    // Find the font by ID
    const foundFont = initialFontsData.find(f => f.id === parseInt(fontId));
    if (foundFont) {
      setFont(foundFont);
      // Optional: Set document title to the font name
      document.title = `${foundFont.name} - Ref.Design`;
    } else {
      // If font not found, redirect to the fonts gallery
      navigate('/fonts');
    }
  }, [fontId, navigate]);

  if (!font) {
    return <div className="font-details-loading">Loading...</div>;
  }

  return (
    <div className="font-details-page">
      {font?.name === 'Right Grotesk' && <RightGroteskFamilyNav />}

      <FontDetailsHero font={font} />

      <FontStylesPreview font={font} />

      <FontSpecimen font={font} />

      <FontSpecimenShowcase font={font} />

      <GlyphsSection font={font} />

      <InformationSection font={font} />

      <section className="font-details-content-placeholder">
        {/* Placeholder for future content scrolling */}
      </section>
    </div>
  );
};

export default FontDetails;
