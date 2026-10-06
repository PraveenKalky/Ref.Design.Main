import React, { useState } from 'react';
import { ArrowUpRight, Bookmark, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cardsData } from './cards-data';
import Pagination from '../pagination/Pagination';
import './card-grid.css';

export const Card = ({ 
  id, 
  name, 
  title, 
  subtitle, 
  image, 
  logo, 
  link, 
  isSaved, 
  toggleSave,
  onDelete,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    navigate(`/admin/websites/edit/${id}`);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(false);
    if (onDelete) onDelete(id);
  };

  return (
    <>
      <div className="card-container" style={{ position: 'relative' }}>
        {isSelectMode && (
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={(e) => { e.stopPropagation(); if (onToggleSelect) onToggleSelect(id); }}
            className="card-select-checkbox"
          />
        )}

        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className={`card-admin-more-btn ${menuOpen ? 'active' : ''}`}
          title="Admin Options"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="card-admin-menu" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={handleEditClick} className="card-admin-menu-item">
              <Pencil size={15} /> Edit Website
            </button>
            <button type="button" onClick={handleDeleteClick} className="card-admin-menu-item danger">
              <Trash2 size={15} /> Delete Website
            </button>
          </div>
        )}

        <Link to={`/websites/${name || id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-image-wrapper">
            <img src={image} alt={title} className="card-image" />
            <div className="card-overlay">
              <div className="card-actions">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/websites/${name || id}`); }}
                  className="card-action-btn card-action-open"
                >
                  <ArrowUpRight strokeWidth={2} size={18} /> Open
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(id); }}
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
        </Link>
      </div>

      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Delete Website</h3>
            <p className="admin-modal-body">
              Are you sure you want to delete <strong>"{title}"</strong>? This action cannot be undone and will permanently remove all associated pages and uploaded media.
            </p>
            <div className="admin-modal-actions">
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(false)}
                className="admin-modal-btn admin-modal-btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete}
                className="admin-modal-btn admin-modal-btn-danger"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function CardGrid({ savedItems, toggleSave }) {
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 24;
  
  const totalPages = Math.ceil(cardsData.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = cardsData.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="card-grid-section">
      <div className="card-grid">
        {currentCards.map((card) => (
          <Card 
            key={card.id} 
            {...card} 
            isSaved={!!savedItems[card.id]}
            toggleSave={toggleSave}
          />
        ))}
      </div>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </section>
  );
}

