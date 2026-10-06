import React, { useState, useRef, useEffect } from 'react';
import { 
  Crop, 
  Bookmark, 
  Share2, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  MessageSquare, 
  MapPin, 
  Check, 
  X, 
  Send
} from 'lucide-react';
import './WebsitePreviewPanel.css';
import dummyImage from '../../../assets/dummy-preview.jpg';
import WebsiteMetadataPanel from './WebsiteMetadataPanel';

export default function WebsitePreviewPanel({
  website,
  isSaved,
  toggleSave
}) {
  const [zoom, setZoom] = useState(1);
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // null | 'comments' | 'annotations'
  const [cropActive, setCropActive] = useState(false);
  const [focusedAnnotationId, setFocusedAnnotationId] = useState(null);

  // Local state for Comments and Annotations
  const [comments, setComments] = useState([
    { id: 1, text: 'Love the clean typography and contrast in the hero section!', user: 'Designer', time: '2h ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const [annotations, setAnnotations] = useState([
    { id: 1, x: 50, y: 12, text: 'Hero Headline' },
    { id: 2, x: 50, y: 35, text: 'Interactive Trading Widget' }
  ]);
  const [draftPin, setDraftPin] = useState(null);
  const [newAnnotationText, setNewAnnotationText] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const zoomWrapperRef = useRef(null);

  if (!website) return null;

  // Close zoom popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (zoomWrapperRef.current && !zoomWrapperRef.current.contains(e.target)) {
        setShowZoomControls(false);
      }
    };
    if (showZoomControls) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showZoomControls]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleImageClick = (e) => {
    if (activePanel !== 'annotations') return;
    if (draftPin) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDraftPin({ x, y });
  };

  const handleAddAnnotation = (e) => {
    e.preventDefault();
    if (newAnnotationText.trim() && draftPin) {
      const newAnn = {
        id: Date.now(),
        x: draftPin.x,
        y: draftPin.y,
        text: newAnnotationText.trim()
      };
      setAnnotations(prev => [...prev, newAnn]);
      setNewAnnotationText('');
      setDraftPin(null);
      setActivePanel('annotations');
      setFocusedAnnotationId(newAnn.id);
    }
  };

  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments(prev => [
        ...prev,
        { id: Date.now(), text: newComment.trim(), user: 'You', time: 'Just now' }
      ]);
      setNewComment('');
      setActivePanel('comments');
    }
  };

  const togglePanel = (panelName) => {
    if (activePanel === panelName) {
      setActivePanel(null);
      setFocusedAnnotationId(null);
    } else {
      setActivePanel(panelName);
    }
  };

  return (
    <div className="preview-workspace-split">
      {/* LEFT COLUMN: Clean Screenshot Canvas */}
      <div className="preview-canvas-viewport-left" ref={containerRef}>
        <div 
          className="preview-canvas-wrapper"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          <img 
            ref={imageRef}
            src={website.image || dummyImage} 
            alt={website.title}
            className={`preview-canvas-img ${cropActive ? 'crop-mode' : ''} ${activePanel === 'annotations' ? 'annotate-mode' : ''}`}
            onClick={handleImageClick}
          />

          {/* Render Crop Handles Overlay if active */}
          {cropActive && (
            <div className="crop-overlay-box">
              <div className="crop-handle handle-tl" />
              <div className="crop-handle handle-tr" />
              <div className="crop-handle handle-bl" />
              <div className="crop-handle handle-br" />
              <div className="crop-actions">
                <button className="crop-confirm-btn" onClick={() => setCropActive(false)}>
                  <Check size={14} /> Done Crop
                </button>
              </div>
            </div>
          )}

          {/* Render Saved Annotation Pins (visible when Annotations panel is active or draft pin is present) */}
          {(activePanel === 'annotations' || draftPin) && annotations.map((ann, i) => (
            <div 
              key={ann.id}
              className={`annotation-pin-badge ${focusedAnnotationId === ann.id ? 'focused' : ''}`}
              style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
              title={ann.text}
              onClick={(e) => {
                e.stopPropagation();
                setFocusedAnnotationId(ann.id);
                setActivePanel('annotations');
              }}
            >
              {i + 1}
            </div>
          ))}

          {/* Render Draft Pin Form */}
          {draftPin && (
            <div 
              className="annotation-draft-popover"
              style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
            >
              <div className="annotation-pin-badge draft">{annotations.length + 1}</div>
              <form onSubmit={handleAddAnnotation} className="draft-form">
                <input 
                  type="text" 
                  placeholder="Type note & hit Enter..." 
                  value={newAnnotationText}
                  onChange={e => setNewAnnotationText(e.target.value)}
                  autoFocus
                />
                <button type="button" className="close-draft-btn" onClick={() => setDraftPin(null)}>
                  <X size={12} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL: Compact Icons Toolbar + On-Demand Drawer + Metadata */}
      <div className="preview-sidebar-panel-right">
        {/* 1. Compact Horizontal Icon Toolbar */}
        <div className="sidebar-action-toolbar compact-single-row">
          <div className="compact-toolbar-icons">
            {/* Crop */}
            <button 
              className={`toolbar-icon-btn ${cropActive ? 'active' : ''}`}
              onClick={() => setCropActive(!cropActive)}
              title="Crop Image"
            >
              <Crop size={16} />
            </button>

            {/* Save / Saved */}
            <button 
              className={`toolbar-icon-btn ${isSaved ? 'active primary-filled' : ''}`}
              onClick={() => toggleSave(website.id)}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark size={16} className={isSaved ? 'save-icon-filled' : ''} />
            </button>

            {/* Share */}
            <button 
              className={`toolbar-icon-btn ${copiedLink ? 'active' : ''}`}
              onClick={handleCopyLink}
              title="Share Link"
            >
              {copiedLink ? <Check size={16} style={{ color: '#22c55e' }} /> : <Share2 size={16} />}
            </button>



            {/* Comment Icon + Count Badge */}
            <button 
              className={`toolbar-icon-btn badge-container ${activePanel === 'comments' ? 'active' : ''}`}
              onClick={() => togglePanel('comments')}
              title="Comments"
            >
              <MessageSquare size={16} />
              {comments.length > 0 && (
                <span className="icon-badge-count">{comments.length}</span>
              )}
            </button>

            {/* Annotate Icon + Count Badge */}
            <button 
              className={`toolbar-icon-btn badge-container ${activePanel === 'annotations' ? 'active' : ''}`}
              onClick={() => togglePanel('annotations')}
              title="Annotations"
            >
              <MapPin size={16} />
              {annotations.length > 0 && (
                <span className="icon-badge-count">{annotations.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* 2. On-Demand Expandable Panel Drawer */}
        {activePanel && (
          <div className="sidebar-ondemand-drawer">
            <div className="drawer-header">
              <span className="drawer-title">
                {activePanel === 'comments' ? `Comments (${comments.length})` : `Annotations (${annotations.length})`}
              </span>
              <button className="drawer-close-btn" onClick={() => setActivePanel(null)} title="Close Panel">
                <X size={14} />
              </button>
            </div>

            <div className="drawer-body">
              {activePanel === 'comments' && (
                <div className="comments-tab-pane">
                  <form onSubmit={handleAddCommentSubmit} className="add-comment-form">
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="send-comment-btn" disabled={!newComment.trim()}>
                      <Send size={14} />
                    </button>
                  </form>

                  <div className="comments-list">
                    {comments.map(c => (
                      <div key={c.id} className="comment-item">
                        <div className="comment-meta">
                          <span className="comment-user">{c.user}</span>
                          <span className="comment-time">{c.time}</span>
                        </div>
                        <p className="comment-text">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'annotations' && (
                <div className="annotations-tab-pane">
                  <p className="annotation-instruction">Click anywhere on screenshot to drop a pin note.</p>
                  {annotations.length === 0 ? (
                    <p className="empty-tab-text">No annotations yet.</p>
                  ) : (
                    <div className="annotations-list-grid">
                      {annotations.map((ann, i) => (
                        <div 
                          key={ann.id} 
                          className={`annotation-row-card ${focusedAnnotationId === ann.id ? 'active' : ''}`}
                          onClick={() => setFocusedAnnotationId(ann.id)}
                        >
                          <span className="ann-num">{i + 1}</span>
                          <span className="ann-text">{ann.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Embedded Metadata Panel */}
        <WebsiteMetadataPanel website={website} />
      </div>
    </div>
  );
}
