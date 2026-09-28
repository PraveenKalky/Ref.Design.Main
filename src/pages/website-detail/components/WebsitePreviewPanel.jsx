import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Maximize, ZoomIn, ZoomOut, MessageSquare, PenTool, Bookmark } from 'lucide-react';
import './WebsitePreviewPanel.css';
import { useNavigate } from 'react-router-dom';
import dummyImage from '../../../assets/dummy-preview.jpg';

export default function WebsitePreviewPanel({
  website,
  interactionMode,
  setInteractionMode,
  annotations,
  onAddAnnotation,
  activeAnnotationId
}) {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  // Create a new annotation draft
  const [draftAnnotation, setDraftAnnotation] = useState(null);
  const draftInputRef = useRef(null);

  useEffect(() => {
    if (draftAnnotation && draftInputRef.current) {
      draftInputRef.current.focus();
    }
  }, [draftAnnotation]);

  // Scroll to active annotation
  useEffect(() => {
    if (activeAnnotationId && containerRef.current && imageRef.current) {
      const ann = annotations.find(a => a.id === activeAnnotationId);
      if (ann) {
        const imgHeight = imageRef.current.offsetHeight;
        const targetY = (ann.y / 100) * imgHeight;
        containerRef.current.scrollTo({
          top: Math.max(0, targetY - containerRef.current.offsetHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeAnnotationId, annotations]);

  if (!website) return null;

  const handleImageClick = (e) => {
    if (interactionMode !== 'annotate') return;
    
    // Prevent adding if already drafting
    if (draftAnnotation) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDraftAnnotation({ x, y, text: '' });
  };

  const handleDraftSubmit = (e) => {
    e.preventDefault();
    if (draftAnnotation.text.trim()) {
      onAddAnnotation({
        x: draftAnnotation.x,
        y: draftAnnotation.y,
        text: draftAnnotation.text
      });
    }
    setDraftAnnotation(null);
  };

  return (
    <div className="website-preview-panel">
      <div className="preview-toolbar">
        <button className="toolbar-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <div className="toolbar-divider" />
        
        <button className="toolbar-btn" onClick={() => setZoom(1)}>
          Fit <Maximize size={14} style={{ marginLeft: 4 }} />
        </button>
        
        <div className="zoom-controls">
          <button className="toolbar-icon-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}><ZoomOut size={16} /></button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="toolbar-icon-btn" onClick={() => setZoom(z => Math.min(3, z + 0.25))}><ZoomIn size={16} /></button>
        </div>
        
        <div className="toolbar-spacer" />
        
        <button 
          className={`toolbar-btn ${interactionMode === 'view' ? 'active' : ''}`}
          onClick={() => setInteractionMode('view')}
        >
          <MessageSquare size={16} /> Comment
        </button>
        <button 
          className={`toolbar-btn ${interactionMode === 'annotate' ? 'active' : ''}`}
          onClick={() => setInteractionMode('annotate')}
        >
          <PenTool size={16} /> Annotate
        </button>
        <button className="toolbar-btn">
          <Bookmark size={16} /> Save
        </button>
      </div>

      <div 
        className={`preview-scroll-container ${interactionMode === 'annotate' ? 'annotate-mode' : ''}`}
        ref={containerRef}
      >
        <div 
          className="preview-image-wrapper" 
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          {website.image ? (
            <img 
              ref={imageRef}
              src={website.image} 
              alt="Website Full Preview" 
              className="full-preview-image"
              onClick={handleImageClick}
            />
          ) : (
            <div className="dummy-preview-image" ref={imageRef} onClick={handleImageClick}>
              {/* Fallback long image if real image is missing */}
              <img 
                src={dummyImage} 
                alt="Dummy Full Preview" 
              />
            </div>
          )}

          {/* Render Saved Annotations */}
          {annotations.map((ann, i) => (
            <div 
              key={ann.id} 
              className={`annotation-pin ${activeAnnotationId === ann.id ? 'active' : ''}`}
              style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            >
              {i + 1}
            </div>
          ))}

          {/* Render Draft Annotation */}
          {draftAnnotation && (
            <div 
              className="annotation-draft-container"
              style={{ left: `${draftAnnotation.x}%`, top: `${draftAnnotation.y}%` }}
            >
              <div className="annotation-pin draft">{annotations.length + 1}</div>
              <form className="annotation-draft-form" onSubmit={handleDraftSubmit}>
                <input 
                  ref={draftInputRef}
                  type="text" 
                  placeholder="Type annotation..." 
                  value={draftAnnotation.text}
                  onChange={e => setDraftAnnotation({...draftAnnotation, text: e.target.value})}
                  onBlur={() => { if(!draftAnnotation.text) setDraftAnnotation(null); }}
                  onKeyDown={e => { if(e.key === 'Escape') setDraftAnnotation(null); }}
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
