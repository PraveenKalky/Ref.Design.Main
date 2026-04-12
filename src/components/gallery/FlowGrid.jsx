import React from 'react';
import FlowCard from './FlowCard';
import './gallery.css';

// Importing mock assets
import ecommerceImg from '../../assets/ecommerce-thumb.png';
import fintechImg from '../../assets/fintech-thumb.png';
import heroImg from '../../assets/hero-preview.png';

const FlowGrid = () => {
  const flows = [
    {
      id: 1,
      title: 'Premium E-commerce Product Flow',
      author: 'DesignVault',
      category: 'E-commerce',
      image: ecommerceImg,
      screenCount: 12,
      views: '2.4k'
    },
    {
      id: 2,
      title: 'Fintech Dashboard & Wallet UI',
      author: 'AuroraTeam',
      category: 'Fintech',
      image: fintechImg,
      screenCount: 18,
      views: '5.1k'
    },
    {
      id: 3,
      title: 'Ref.Design Platform Overview',
      author: 'RefSystem',
      category: 'SaaS',
      image: heroImg,
      screenCount: 8,
      views: '1.2k'
    },
    {
        id: 4,
        title: 'Minimalist Portfolio Experience',
        author: 'StudioAlpha',
        category: 'Creative',
        image: ecommerceImg, // Reusing for placeholder
        screenCount: 6,
        views: '800'
      },
      {
        id: 5,
        title: 'Healthcare Analytics System',
        author: 'MediData',
        category: 'Health',
        image: fintechImg, // Reusing for placeholder
        screenCount: 24,
        views: '3.7k'
      },
      {
        id: 6,
        title: 'Travel Booking Discovery',
        author: 'NomadFlow',
        category: 'Travel',
        image: heroImg, // Reusing for placeholder
        screenCount: 15,
        views: '4.2k'
      }
  ];

  return (
    <div className="gallery-grid">
      {flows.map((flow) => (
        <FlowCard key={flow.id} flow={flow} />
      ))}
    </div>
  );
};

export default FlowGrid;
