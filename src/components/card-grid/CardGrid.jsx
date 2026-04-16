import React, { useState } from 'react';
import { ArrowUpRight, Bookmark } from 'lucide-react';
import { cardsData } from './cards-data';
import Pagination from '../pagination/Pagination';
import './card-grid.css';

const Card = ({ id, name, title, subtitle, image, logo, link, isSaved, toggleSave }) => {
  return (
    <div className="card-container">
      <div className="card-image-wrapper">
        <img src={image} alt={title} className="card-image" />
        <div className="card-overlay">
          <div className="card-actions">
            <button 
              onClick={(e) => { e.stopPropagation(); window.open(link, '_blank'); }}
              className="card-action-btn card-action-open"
            >
              <ArrowUpRight strokeWidth={2} size={18} /> Open
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleSave(id); }}
              className={`card-action-btn card-action-save ${isSaved ? 'saved' : ''}`}
            >
              <Bookmark 
                strokeWidth={2} 
                size={18} 
                className={isSaved ? 'save-icon-filled' : ''} 
              /> 
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
      <div className="card-meta">
        <img src={logo} alt={`${title} Logo`} className="card-logo" />
        <div className="card-text-container">
          <div className="card-title">{title}</div>
          <div className="card-subtitle">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

export default function CardGrid({ savedItems, toggleSave }) {
  return (
    <section className="card-grid-section">
      <div className="card-grid">
        {cardsData.map((card) => (
          <Card 
            key={card.id} 
            {...card} 
            isSaved={!!savedItems[card.id]}
            toggleSave={toggleSave}
          />
        ))}
      </div>
      <Pagination />
    </section>
  );
}
