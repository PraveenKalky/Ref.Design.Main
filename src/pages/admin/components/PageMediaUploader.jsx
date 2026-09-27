import ActiveUploadItem from "./ActiveUploadItem";
import { uploadWithProgress } from "../../../utils/uploadXHR";
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { UploadCloud, Loader, Trash2, Play, Eye, Pencil, Check, X, LayoutList, LayoutGrid } from 'lucide-react';
import { SquaresFour, List } from "@phosphor-icons/react";

import './PageMediaUploader.css';

const MAX_SIZE_MB = 100;

const UI_KEYWORDS = [
  'Dashboard', 'Transactions', 'Portfolio', 'Markets', 'Pricing', 
  'Settings', 'Login', 'Signup', 'Register', 'Hero', 'Features', 
  'Navigation', 'Footer', 'Checkout', 'Cart', 'Profile', 'Activity'
];

// Call Supabase Edge Function to analyze the image with Gemini 1.5 Flash
const analyzeImageWithAI = async (publicUrl) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-media-label', {
      body: { imageUrl: publicUrl }
    });
    if (error) throw error;
    if (data && data.label) {
      return data.label;
    }
    return null;
  } catch (err) {
    console.error('AI Labelling Error:', err);
    return null;
  }
};

// Helper to generate a human-readable title from filename
const generateCleanTitle = (filename) => {
  let clean = filename.replace(/\.[^/.]+$/, ""); // remove extension
  
  // Strip UUIDs
  clean = clean.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '');
  
  // Strip 32-char hex hashes (like md5)
  clean = clean.replace(/[0-9a-fA-F]{32}/g, '');
  
  // Strip 13-digit timestamps at start (Date.now())
  clean = clean.replace(/^[0-9]{13}-?/, '');

  clean = clean
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If the string is empty or just numbers/symbols after cleaning, use a default
  if (!clean || clean.match(/^[\s\(\)0-9]*$/)) {
    return "Uploaded Media";
  }

  return clean.replace(/\b\w/g, l => l.toUpperCase());
};

const MediaListItem = ({ item, index, onRemove, onUpdate, onPreview, viewMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const inputRef = useRef(null);

  const isVideo = item.url.match(/\.(mp4|mov|webm)$/i);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdate(index, { ...item, title: editTitle.trim() });
    } else {
      setEditTitle(item.title); // revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(item.title);
      setIsEditing(false);
    }
  };

  const isCard = viewMode === 'card';

  return (
    <div className={isCard ? 'pmu-card-item' : 'pmu-item list-mode'}>
      <div className="pmu-item-thumbnail" onClick={() => onPreview(item)} style={{ cursor: "pointer" }}>
        {isVideo ? (
          <>
            <video src={item.url} className="pmu-thumb-media" preload="metadata" />
            <div className="pmu-play-indicator">
              <Play size={12} fill="white" />
            </div>
          </>
        ) : (
          <img src={item.url} alt={item.title} className="pmu-thumb-media" />
        )}
      </div>

      <div className="pmu-item-content">
        {isEditing ? (
          <div className="pmu-title-edit-mode">
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              className="pmu-title-input"
            />
            <button className="pmu-save-btn" onMouseDown={(e) => { e.preventDefault(); handleSaveTitle(); }}>
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="pmu-title-view-mode" onClick={() => setIsEditing(true)}>
            <span className="pmu-item-title">{item.title}</span>
            <Pencil size={14} className="pmu-edit-icon" />
          </div>
        )}
        {!isCard && <div className="pmu-item-filename">{item.filename}</div>}
      </div>

      <div className={isCard ? "pmu-item-actions" : "pmu-list-actions"}>
        <button type="button" onClick={() => onPreview(item)} className="pmu-list-btn" title="Preview">
          <Eye size={16} /> {!isCard && <span>Preview</span>}
        </button>
        <button type="button" onClick={() => onRemove(index)} className="pmu-list-btn remove-btn" title="Remove">
          <Trash2 size={16} /> {!isCard && <span>Remove</span>}
        </button>
      </div>

    </div>
  );
};

const PreviewModal = ({ item, index, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const inputRef = useRef(null);
  
  const isVideo = item.url.match(/\.(mp4|mov|webm)$/i);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdate(index, { ...item, title: editTitle.trim() });
    } else {
      setEditTitle(item.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(item.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="pmu-modal-overlay" onClick={onClose}>
      <div className="pmu-modal-content" onClick={e => e.stopPropagation()}>
        <div className="pmu-modal-header">
          <h3>Preview</h3>
          <button className="pmu-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="pmu-modal-body">
          <div className="pmu-modal-meta">
            <span className="pmu-modal-label">Name</span>
            {isEditing ? (
              <div className="pmu-title-edit-mode">
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleKeyDown}
                  className="pmu-title-input"
                />
                <button className="pmu-save-btn" onMouseDown={(e) => { e.preventDefault(); handleSaveTitle(); }}>
                  <Check size={14} /> Save
                </button>
              </div>
            ) : (
              <div className="pmu-title-view-mode pmu-modal-title" onClick={() => setIsEditing(true)}>
                <span>{item.title}</span>
                <Pencil size={14} className="pmu-edit-icon" />
              </div>
            )}
          </div>
          
          <div className="pmu-modal-large-preview">
            {isVideo ? (
              <video src={item.url} controls className="pmu-modal-media" />
            ) : (
              <img src={item.url} alt={item.title} className="pmu-modal-media" />
            )}
          </div>
          
          <div className="pmu-modal-filename" title={item.filename}>{item.filename}</div>
        </div>
        
        <div className="pmu-modal-footer">
          <button className="pmu-action-btn pmu-action-remove" onClick={() => { onDelete(index); onClose(); }}>
            Delete
          </button>
          <button className="pmu-action-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};


const PageMediaUploader = ({ media = [], onChange, folder = 'pages' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('pmu-view-mode') || 'card');
  const [previewItem, setPreviewItem] = useState(null);
  const inputRef = useRef(null);

  const [activeUploads, setActiveUploads] = useState([]);
  const cancelledUploads = useRef(new Set());
  
  // Ref for safe queuing
  const mediaRef = useRef(media);
  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  const flushQueue = useRef([]);
  const flushTimeout = useRef(null);

  const handleUploadComplete = (newItem) => {
    flushQueue.current.push(newItem);
    if (!flushTimeout.current) {
      flushTimeout.current = setTimeout(() => {
        // Ensure we handle legacy string normalization properly before merging
        const normalizedBase = mediaRef.current.map(m => 
          typeof m === 'string' ? { url: m, title: 'Uploaded Media', filename: 'Unknown File' } : m
        );
        onChange([...normalizedBase, ...flushQueue.current]);
        flushQueue.current = [];
        flushTimeout.current = null;
      }, 50);
    }
  };

  const cancelUpload = (id) => {
    cancelledUploads.current.add(id);
    setActiveUploads(prev => {
      const target = prev.find(u => u.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(u => u.id !== id);
    });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('pmu-view-mode', mode);
  };

  const normalizedMedia = media.map(m => 
    typeof m === 'string' ? { url: m, title: 'Uploaded Media', filename: 'Unknown File' } : m
  );

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUpload = (files) => {
    setErrorMsg('');
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/quicktime'];
    const filesToUpload = Array.from(files).filter(file => {
      if (!validTypes.includes(file.type)) {
        setErrorMsg('Some files were skipped. Unsupported type. Please upload PNG, JPG, JPEG, WEBP, MP4, or MOV.');
        return false;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrorMsg(`Some files were skipped. Maximum size is ${MAX_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    if (filesToUpload.length === 0) return;

    const newUploads = filesToUpload.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      filename: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
      status: 'uploading',
      progressText: 'Uploading...',
      progress: 0,
    }));

    setActiveUploads(prev => [...prev, ...newUploads]);

    newUploads.forEach(async (uploadItem) => {
      try {
        const fileExt = uploadItem.file.name.split('.').pop();
        const tempFileName = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const tempFilePath = `${folder}/${tempFileName}`;

        const uploadResult = await uploadWithProgress(uploadItem.file, 'submissions', tempFilePath, (percent) => {
          setActiveUploads(prev => prev.map(u => 
            u.id === uploadItem.id ? { ...u, progress: percent } : u
          ));
        });

        if (cancelledUploads.current.has(uploadItem.id)) return;
        if (uploadResult.error) throw uploadResult.error;

        const { data: { publicUrl: tempPublicUrl } } = supabase.storage
          .from('submissions')
          .getPublicUrl(tempFilePath);
          
        let aiResult = null;
        if (uploadItem.file.type.startsWith('image/')) {
          setActiveUploads(prev => prev.map(u => 
            u.id === uploadItem.id ? { ...u, progressText: 'AI Analyzing...' } : u
          ));
          aiResult = await analyzeImageWithAI(tempPublicUrl);
        }

        const finalTitle = aiResult || generateCleanTitle(uploadItem.file.name);
        
        // Sanitize the AI title into a clean filename
        let baseCleanName = finalTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (!baseCleanName) baseCleanName = `media-${Date.now()}`;
        
        // Append a tiny random hash to guarantee uniqueness and avoid overwrite errors
        const uniqueHash = Math.random().toString(36).substring(7, 11);
        let finalCleanFileName = `${baseCleanName}-${uniqueHash}.${fileExt}`;
        const finalFilePath = `${folder}/${finalCleanFileName}`;

        // Move the file in Supabase from temp to semantic name
        const { error: moveError } = await supabase.storage
          .from('submissions')
          .move(tempFilePath, finalFilePath);

        let actualFilePath = finalFilePath;
        let finalFileName = finalCleanFileName;

        if (moveError) {
           console.error("Move failed, falling back to temp file:", moveError);
           actualFilePath = tempFilePath; // Just keep the temp one if it fails
           finalFileName = tempFileName;
        }

        const { data: { publicUrl: finalPublicUrl } } = supabase.storage
          .from('submissions')
          .getPublicUrl(actualFilePath);
        
        const finalItem = {
          url: finalPublicUrl,
          title: finalTitle,
          filename: finalFileName
        };

        handleUploadComplete(finalItem);
        
        setActiveUploads(prev => prev.filter(u => u.id !== uploadItem.id));
        URL.revokeObjectURL(uploadItem.previewUrl);

      } catch (err) {
        console.error('Error in upload process:', err);
        if (!cancelledUploads.current.has(uploadItem.id)) {
          setActiveUploads(prev => prev.map(u => 
            u.id === uploadItem.id ? { ...u, status: 'error', progressText: 'Failed to upload' } : u
          ));
        }
      }
    });

    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files);
    }
    // reset input value so the same file can be selected again
    e.target.value = null;
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleRemove = (indexToRemove) => {
    const newMedia = normalizedMedia.filter((_, index) => index !== indexToRemove);
    onChange(newMedia);
  };

  const handleUpdate = (indexToUpdate, updatedItem) => {
    const newMedia = [...normalizedMedia];
    newMedia[indexToUpdate] = updatedItem;
    onChange(newMedia);
    if (previewItem && previewItem.index === indexToUpdate) {
      setPreviewItem({ index: indexToUpdate, item: updatedItem });
    }
  };

  const handlePreview = (item, index) => {
    setPreviewItem({ item, index });
  };

  return (
    <div className="page-media-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, video/mp4, video/quicktime"
        multiple
        onChange={handleChange}
        style={{ display: "none" }}
      />
      
      <div 
        className={`pmu-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <div className="pmu-empty-state">
          <div className="pmu-icon-circle-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z"></path>
            </svg>
          </div>
          <p className="pmu-main-text" style={{ fontWeight: '500' }}>
            Choose a file or drag & drop it here.
          </p>
          <p className="pmu-sub-text">
            PNG, JPG, JPEG, WEBP, MP4, MOV
          </p>
          <button 
            type="button"
            className="pmu-browse-btn"
            onClick={(e) => { e.stopPropagation(); onButtonClick(); }}
          >
            Browse File
          </button>
        </div>
      </div>

      {activeUploads.length > 0 && (
        <div className="pmu-active-uploads-list">
          <h4 className="pmu-active-uploads-title">Uploading ({activeUploads.length})</h4>
          {activeUploads.map(upload => (
            <ActiveUploadItem key={upload.id} upload={upload} onCancel={cancelUpload} />
          ))}
        </div>
      )}

      {errorMsg && <div className="pmu-error-msg">{errorMsg}</div>}

      {normalizedMedia.length > 0 && (
        <>
          <div className="pmu-view-switcher">
            <span className="pmu-view-label">View:</span>
            <div className="font-view-toggle">
              <span 
                className={`toggle-text ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('card')}
                title="Card view"
              >
                <SquaresFour size={20} />
              </span>
              <span 
                className={`toggle-text ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('list')}
                title="List view"
              >
                <List size={20} />
              </span>
            </div>
          </div>
          <div className={`pmu-media-container ${viewMode === 'card' ? 'pmu-grid-view' : 'pmu-list-view'}`}>
            {normalizedMedia.map((item, index) => (
              <MediaListItem 
                key={index} 
                index={index}
                item={item} 
                onRemove={handleRemove}
                onUpdate={handleUpdate}
                onPreview={(i) => handlePreview(i, index)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </>
      )}

      {previewItem && (
        <PreviewModal 
          item={previewItem.item}
          index={previewItem.index}
          onClose={() => setPreviewItem(null)}
          onUpdate={handleUpdate}
          onDelete={(idx) => {
             handleRemove(idx);
             setPreviewItem(null);
          }}
        />
      )}
    </div>
  );
};

export default PageMediaUploader;
