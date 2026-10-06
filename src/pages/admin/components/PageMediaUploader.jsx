import ActiveUploadItem from "./ActiveUploadItem";
import { uploadWithProgress } from "../../../utils/uploadXHR";
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { UploadCloud, Loader, Trash2, Play, Eye, Pencil, Check, X, LayoutList, LayoutGrid, Crop, Image as ImageIcon } from 'lucide-react';
import { SquaresFour, List } from "@phosphor-icons/react";
import ThumbnailCropModal from './ThumbnailCropModal';

import './PageMediaUploader.css';

const MAX_SIZE_MB = 100;

const UI_KEYWORDS = [
  'Dashboard', 'Transactions', 'Portfolio', 'Markets', 'Pricing', 
  'Settings', 'Login', 'Signup', 'Register', 'Hero', 'Features', 
  'Navigation', 'Footer', 'Checkout', 'Cart', 'Profile', 'Activity'
];

// Helper to auto-generate a 16:10 top-fold thumbnail from a full screenshot
const generateAutoThumbnail = (file, targetRatio = 16 / 10) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/') || file.type.includes('svg')) {
      return resolve(null);
    }
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;

      const cropW = naturalW;
      const cropH = Math.min(naturalH, Math.round(naturalW / targetRatio));

      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = Math.round(1280 / targetRatio);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, cropW, cropH, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const thumbFile = new File([blob], `thumb-${file.name}`, { type: 'image/jpeg' });
          resolve({
            file: thumbFile,
            cropData: { yPercent: 0, heightPercent: (cropH / naturalH) * 100 }
          });
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
};

// Helper to compress image for AI processing to reduce base64 size and speed up Gemini response
const compressImageForAI = (file, maxDimension = 1280, quality = 0.8) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/') || file.type.includes('svg')) {
      return resolve(file);
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension && file.size < 600 * 1024) {
        return resolve(file);
      }
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
};

// Call Supabase Edge Function to analyze the image with Gemini 1.5 Flash
const analyzeImageWithAI = async (fileOrUrl) => {
  try {
    let payload = {};
    if (typeof fileOrUrl === 'string') {
      payload = { imageUrl: fileOrUrl };
    } else if (fileOrUrl instanceof File) {
      console.log(`[AI Rename] Preparing image "${fileOrUrl.name}" for Gemini AI analysis...`);
      const targetFile = await compressImageForAI(fileOrUrl);
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(targetFile);
      });
      payload = { imageBase64: base64, mimeType: targetFile.type };
    }

    const { data, error } = await supabase.functions.invoke('generate-media-label', {
      body: payload
    });
    if (error) throw error;
    if (data && data.label) {
      console.log(`[AI Rename] Gemini successfully generated label: "${data.label}"`);
      return data.label;
    }
    return null;
  } catch (err) {
    console.error('[AI Rename] AI Labelling Error:', err);
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

const MediaListItem = ({ item, index, onRemove, onUpdate, onPreview, onAdjustCrop, viewMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const inputRef = useRef(null);

  const isVideo = (item.url || '').match(/\.(mp4|mov|webm)$/i);
  const displayThumbUrl = item.thumbnailUrl || item.url;

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
          <img src={displayThumbUrl} alt={item.title} className="pmu-thumb-media" />
        )}
        
        {!isVideo && (
          <div className="pmu-thumb-badge" title="Card Thumbnail (16:10)">
            <Crop size={10} /> 16:10
          </div>
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
        {!isVideo && (
          <button type="button" onClick={() => onAdjustCrop(item, index)} className="pmu-list-btn crop-btn" title="Adjust Thumbnail Crop">
            <Crop size={15} /> {!isCard && <span>Adjust Crop</span>}
          </button>
        )}
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

  const handleUploadComplete = (newItem) => {
    const normalizedBase = mediaRef.current.map(m => 
      typeof m === 'string' ? { url: m, title: 'Uploaded Media', filename: 'Unknown File' } : m
    );
    onChange([...normalizedBase, newItem]);
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

  const computeFileHash = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      return `${file.name}-${file.size}`;
    }
  };

  const validateAndUpload = async (files) => {
    setErrorMsg('');
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/quicktime'];
    const candidates = Array.from(files).filter(file => {
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

    if (candidates.length === 0) return;

    // Calculate hashes and filter duplicates
    const existingFilenames = new Set(normalizedMedia.map(m => m.filename));
    const filesToUpload = [];
    let duplicatesFound = 0;

    for (const file of candidates) {
      const hash = await computeFileHash(file);
      // Check duplicate hash or filename
      const isDuplicateInMedia = normalizedMedia.some(m => m.hash === hash || m.filename === file.name);
      const isDuplicateInActive = activeUploads.some(u => u.hash === hash);

      if (isDuplicateInMedia || isDuplicateInActive) {
        duplicatesFound++;
        continue;
      }

      filesToUpload.push({ file, hash });
    }

    if (duplicatesFound > 0) {
      setErrorMsg(`Already uploaded. (${duplicatesFound} duplicate file${duplicatesFound > 1 ? 's' : ''} skipped)`);
    }

    if (filesToUpload.length === 0) return;

    const newUploads = filesToUpload.map(({ file, hash }) => ({
      id: Math.random().toString(36).substring(7),
      file,
      hash,
      filename: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
      status: 'preparing',
      progressText: 'Preparing...',
      progress: 0,
    }));

    setActiveUploads(prev => [...prev, ...newUploads]);

    newUploads.forEach(async (uploadItem) => {
      try {
        const fileExt = uploadItem.file.name.split('.').pop();
        const uniqueHash = Math.random().toString(36).substring(7, 11);
        
        setActiveUploads(prev => prev.map(u => 
          u.id === uploadItem.id ? { ...u, status: 'uploading', progressText: 'Analyzing media...', progress: 10 } : u
        ));

        // 1. First run Gemini AI analysis (or fall back to clean title) to determine semantic title
        const aiResult = uploadItem.file.type.startsWith('image/')
          ? await analyzeImageWithAI(uploadItem.file)
          : null;

        const finalTitle = aiResult || generateCleanTitle(uploadItem.file.name);
        
        // 2. Format a clean, semantic slug for storage
        let semanticBaseName = finalTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        if (!semanticBaseName || semanticBaseName === 'uploaded-media') {
          const rawClean = generateCleanTitle(uploadItem.file.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          semanticBaseName = rawClean || `media-${Date.now()}`;
        }

        const finalCleanFileName = `${semanticBaseName}-${uniqueHash}.${fileExt}`;
        const filePath = `${folder}/${finalCleanFileName}`;

        setActiveUploads(prev => prev.map(u => 
          u.id === uploadItem.id ? { ...u, status: 'uploading', progressText: 'Uploading...', progress: 30 } : u
        ));

        // 3. Upload full page screenshot file directly to the semantic file path in Supabase Storage (UNCROPPED)
        const uploadResult = await uploadWithProgress(uploadItem.file, 'submissions', filePath, (percent) => {
          setActiveUploads(prev => prev.map(u => 
            u.id === uploadItem.id ? { ...u, status: 'uploading', progress: Math.max(30, percent) } : u
          ));
        });

        if (cancelledUploads.current.has(uploadItem.id)) return;
        if (uploadResult.error) throw uploadResult.error;

        const { data: { publicUrl } } = supabase.storage
          .from('submissions')
          .getPublicUrl(filePath);

        // 4. Auto-generate 16:10 top-fold thumbnail for card preview
        let thumbnailUrl = publicUrl;
        let thumbnailSource = 'none';
        let cropData = null;

        if (uploadItem.file.type.startsWith('image/')) {
          setActiveUploads(prev => prev.map(u => 
            u.id === uploadItem.id ? { ...u, progressText: 'Generating card thumbnail...', progress: 85 } : u
          ));
          
          const autoThumbResult = await generateAutoThumbnail(uploadItem.file);
          if (autoThumbResult) {
            const thumbPath = `thumbnails/thumb-${semanticBaseName}-${uniqueHash}.jpg`;
            const thumbUploadResult = await uploadWithProgress(autoThumbResult.file, 'submissions', thumbPath, () => {});
            if (!thumbUploadResult.error) {
              const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
                .from('submissions')
                .getPublicUrl(thumbPath);
              thumbnailUrl = thumbPublicUrl;
              thumbnailSource = 'auto_crop';
              cropData = autoThumbResult.cropData;
            }
          }
        }

        const finalItem = {
          url: publicUrl,
          thumbnailUrl: thumbnailUrl,
          thumbnailSource: thumbnailSource,
          cropData: cropData,
          title: finalTitle,
          filename: finalCleanFileName,
          hash: uploadItem.hash
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

  const [cropItem, setCropItem] = useState(null);

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
            PNG, JPG, JPEG, WEBP, MP4, MOV (Auto 16:10 card thumbnails generated)
          </p>
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
                onAdjustCrop={(i, idx) => setCropItem({ item: i, index: idx })}
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

      {cropItem && (
        <ThumbnailCropModal
          item={cropItem.item}
          index={cropItem.index}
          onClose={() => setCropItem(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default PageMediaUploader;
