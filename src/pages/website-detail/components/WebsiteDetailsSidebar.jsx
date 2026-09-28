import React, { useState } from 'react';
import { Bookmark, Share, MessageSquare, Plus, Check } from 'lucide-react';
import './WebsiteDetailsSidebar.css';

export default function WebsiteDetailsSidebar({
  website,
  isSaved,
  toggleSave,
  annotations,
  onAnnotationClick,
  comments,
  onAddComment
}) {
  const [newComment, setNewComment] = useState('');

  if (!website) return null;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="website-details-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">{website.title}</h1>
        <p className="sidebar-subtitle">{website.subtitle}</p>
        
        <div className="sidebar-actions">
          <button 
            className={`action-btn ${isSaved ? 'primary' : ''}`}
            onClick={() => toggleSave(website.id)}
          >
            <Bookmark size={16} className={isSaved ? 'save-icon-filled' : ''} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button className="action-btn icon-only">
            <Share size={16} />
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="section-heading">Page Details</h3>
        <div className="details-grid">
          <div className="detail-row">
            <span className="detail-label">Type</span>
            <span className="detail-value">{website.categories?.[0] || 'Landing Page'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Industry</span>
            <span className="detail-value">SaaS</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Style</span>
            <span className="detail-value">Minimal</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Added</span>
            <span className="detail-value">Sep 2026</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="section-heading">Tags</h3>
        <div className="tags-container">
          <span className="tag-pill">Pricing</span>
          <span className="tag-pill">SaaS</span>
          <span className="tag-pill">Cards</span>
          <span className="tag-pill">CTA</span>
          <button className="tag-add-btn"><Plus size={14} /></button>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section annotations-section">
        <h3 className="section-heading">Annotations</h3>
        {annotations.length === 0 ? (
          <p className="empty-text">No annotations yet. Click 'Annotate' and click on the image to add one.</p>
        ) : (
          <div className="annotations-list">
            {annotations.map((ann, i) => (
              <div 
                key={ann.id} 
                className="annotation-item"
                onClick={() => onAnnotationClick(ann)}
              >
                <div className="annotation-number">{i + 1}</div>
                <div className="annotation-content">
                  <p className="annotation-text">{ann.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section comments-section">
        <h3 className="section-heading">Comments</h3>
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">{c.user[0]}</div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-user">{c.user}</span>
                  <span className="comment-date">{c.date}</span>
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <input 
            type="text" 
            placeholder="+ Add comment" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input"
          />
        </form>
      </div>
    </div>
  );
}
