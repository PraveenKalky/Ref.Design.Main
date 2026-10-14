import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, CaretDown, Sparkle, MagnifyingGlass, Plus, Star, ClipboardText } from '@phosphor-icons/react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { uploadWithProgress } from '../../../utils/uploadXHR';
import { sanitizeSectionName } from '../../admin/components/PageMediaUploader';
import { ALL_SECTION_CATEGORIES, GEMINI_SECTION_CATEGORIES } from '../../../data/section-categories';
import { classifySection } from '../../../utils/sectionTaxonomy';
import { saveDraft, loadDraft, clearDraft } from '../../../utils/draftStorage';
import './section-upload-drawer.css';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const MAX_SIZE_MB = 100;
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/avif'];
const VALID_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-m4v'];
const ALL_VALID_TYPES = [...VALID_IMAGE_TYPES, ...VALID_VIDEO_TYPES];

const isVideoFile = (file) => file?.type?.startsWith('video/') || false;

const isAnimatedFile = (file) => {
  if (!file) return false;
  const type = file.type || '';
  const name = file.name || '';
  return (
    type === 'image/gif' ||
    type === 'image/avif' ||
    name.toLowerCase().endsWith('.gif') ||
    name.toLowerCase().endsWith('.avif')
  );
};

const compressImageForAI = (file, maxDimension = 1280, quality = 0.8) =>
  new Promise((resolve) => {
    if (!file?.type?.startsWith('image/') || file.type.includes('svg') || isAnimatedFile(file)) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension && file.size < 600 * 1024) return resolve(file);
      if (width > height) {
        if (width > maxDimension) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
      } else {
        if (height > maxDimension) { width = Math.round((width * maxDimension) / height); height = maxDimension; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

const generateAutoThumbnail = (file, maxDimension = 1280) =>
  new Promise((resolve) => {
    if (!file?.type?.startsWith('image/') || file.type.includes('svg') || isAnimatedFile(file)) return resolve(null);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      let width = naturalW;
      let height = naturalH;
      if (width > height) {
        if (width > maxDimension) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
      } else {
        if (height > maxDimension) { width = Math.round((width * maxDimension) / height); height = maxDimension; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (blob) resolve({ file: new File([blob], `thumb-${file.name}.jpg`, { type: 'image/jpeg' }) });
        else resolve(null);
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });

const generateVideoThumbnail = (file, maxDimension = 1280) =>
  new Promise((resolve) => {
    if (!isVideoFile(file)) return resolve(null);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    let seekFired = false;
    const finishWithFrame = () => {
      if (seekFired) return;
      seekFired = true;
      try {
        const naturalW = video.videoWidth || 1280;
        const naturalH = video.videoHeight || 720;
        let width = naturalW;
        let height = naturalH;
        if (width > height) {
          if (width > maxDimension) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
        } else {
          if (height > maxDimension) { width = Math.round((width * maxDimension) / height); height = maxDimension; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve({
              file: new File([blob], `thumb-${file.name.replace(/\.[^/.]+$/, '')}.jpg`, { type: 'image/jpeg' })
            });
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.85);
      } catch {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };

    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 4);
    };
    video.onseeked = finishWithFrame;
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    // Fallback timeout in case video seek doesn't trigger
    setTimeout(() => finishWithFrame(), 3000);
  });

const computeFileHash = async (file) => {
  try {
    const buf = await file.arrayBuffer();
    const hashArr = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buf)));
    return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `${file.name}-${file.size}`;
  }
};

const analyzeWithGemini = async (file) => {
  try {
    // If video, cannot classify via image endpoint; return null
    if (isVideoFile(file)) return null;

    const targetFile = await compressImageForAI(file);
    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(targetFile);
    });
    const categoryList = GEMINI_SECTION_CATEGORIES.join(', ');
    const { data, error } = await supabase.functions.invoke('generate-media-label', {
      body: {
        imageBase64: base64,
        mimeType: targetFile.type,
        prompt: `You are a UI/UX expert. Identify the type of UI section shown in this screenshot. Choose the BEST match from this list: ${categoryList}. Return ONLY the section name, 1–3 words. No quotes, no extra text.`,
      },
    });
    if (error || !data?.label) return null;
    return sanitizeSectionName(data.label) || null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const DEFAULT_SECTION_TAGS = [
  'Dark Mode',
  'Light Mode',
  'SaaS',
  'Fintech',
  'Crypto',
  'Web3',
  'Bento Grid',
  'Split Layout',
  'Minimal',
  'Gradient',
  'Interactive',
  'Cards',
  'Sticky',
  'Multi-step',
  'Animation',
  'Illustration',
  'Mobile',
  'Responsive',
  'Pricing Table',
  'Dashboard',
  'Hero',
  'Modal',
  'Dropdown',
  'Table',
  'Form',
  'Tabs',
  'Carousel',
  'Accordion',
  'Stats',
  'Testimonial',
  'CTA',
  'Navbar',
  'Footer',
];

function CategoryDropdown({ value, onChange, isOpen: controlledOpen, onToggle, onClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxScrollHeight, setMaxScrollHeight] = useState(320);
  const ref = useRef(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        if (isControlled) {
          onClose?.();
        } else {
          setInternalOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isControlled, onClose]);

  useEffect(() => {
    if (open) setSearchQuery('');
  }, [open]);

  // Viewport-aware height adjustment to avoid clipping near drawer bottom
  useEffect(() => {
    if (!open) return;

    const adjustHeight = () => {
      if (!ref.current) return;
      const cardEl = ref.current.closest('.sud-strip-card') || ref.current;
      const cardRect = cardEl.getBoundingClientRect();
      const panelEl = ref.current.closest('.sud-panel');
      const footerEl = panelEl?.querySelector('.sud-footer');
      
      const bottomBoundary = footerEl 
        ? footerEl.getBoundingClientRect().top 
        : (panelEl ? panelEl.getBoundingClientRect().bottom : window.innerHeight);

      // Available space below card (with margin)
      const spaceBelow = bottomBoundary - cardRect.bottom - 24;
      const idealHeight = 320; // 10 rows

      if (spaceBelow >= idealHeight + 60) {
        setMaxScrollHeight(idealHeight);
      } else {
        const availForScroll = Math.max(158, spaceBelow - 55);
        // Snap to complete rows: row pitch is 32px (26px height + 6px gap)
        const rowsFit = Math.max(4, Math.floor((availForScroll + 2) / 32));
        const snappedHeight = rowsFit * 32;
        setMaxScrollHeight(snappedHeight);

        if (spaceBelow < 280) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    adjustHeight();
    const timer = setTimeout(adjustHeight, 320);
    window.addEventListener('resize', adjustHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', adjustHeight);
    };
  }, [open]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = ALL_SECTION_CATEGORIES.filter(c =>
    !normalizedQuery || c.toLowerCase().includes(normalizedQuery)
  );

  const handleSelect = (cat) => {
    if (value === cat) {
      onChange('Other');
    } else {
      onChange(cat);
    }
    if (isControlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalOpen(o => !o);
    }
  };

  return (
    <div className="sud-dropdown-container" ref={ref}>
      <button
        type="button"
        className={`sud-dropdown-trigger ${open ? 'is-open' : ''}`}
        onClick={handleToggle}
        title="Select Category"
      >
        <span className="sud-dropdown-value">{value || 'Select category…'}</span>
        <CaretDown size={13} weight="bold" className={`sud-dropdown-caret ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <div className="sud-dropdown-menu" role="dialog" aria-label="Category selector">
          {/* 1. Search Bar */}
          <div className="sud-dropdown-search-wrap">
            <MagnifyingGlass size={13} weight="bold" className="sud-search-icon" />
            <input
              type="text"
              className="sud-dropdown-search-input"
              placeholder="Search categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="sud-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>

          {/* 2. Selectable Category Pills Cloud */}
          <div 
            className="sud-tags-cloud-scroll"
            style={{ maxHeight: `${maxScrollHeight}px` }}
          >
            <div className="sud-tags-cloud">
              {filteredCategories.map(cat => {
                const isSelected = value === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`sud-tag-pill ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelect(cat)}
                  >
                    {isSelected && <Check size={11} weight="bold" className="sud-tag-check" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
              {filteredCategories.length === 0 && (
                <div className="sud-dropdown-empty">No categories matching &ldquo;{searchQuery}&rdquo;</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TagsDropdown({ value = [], onChange, isOpen: controlledOpen, onToggle, onClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [maxScrollHeight, setMaxScrollHeight] = useState(320);
  const ref = useRef(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        if (isControlled) {
          onClose?.();
        } else {
          setInternalOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isControlled, onClose]);

  useEffect(() => {
    if (open) setSearchQuery('');
  }, [open]);

  // Viewport-aware height adjustment to avoid clipping near drawer bottom
  useEffect(() => {
    if (!open) return;

    const adjustHeight = () => {
      if (!ref.current) return;
      const cardEl = ref.current.closest('.sud-strip-card') || ref.current;
      const cardRect = cardEl.getBoundingClientRect();
      const panelEl = ref.current.closest('.sud-panel');
      const footerEl = panelEl?.querySelector('.sud-footer');
      
      const bottomBoundary = footerEl 
        ? footerEl.getBoundingClientRect().top 
        : (panelEl ? panelEl.getBoundingClientRect().bottom : window.innerHeight);

      const spaceBelow = bottomBoundary - cardRect.bottom - 24;
      const idealHeight = 320;

      if (spaceBelow >= idealHeight + 60) {
        setMaxScrollHeight(idealHeight);
      } else {
        const availForScroll = Math.max(158, spaceBelow - 55);
        const rowsFit = Math.max(4, Math.floor((availForScroll + 2) / 32));
        const snappedHeight = rowsFit * 32;
        setMaxScrollHeight(snappedHeight);

        if (spaceBelow < 280) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    adjustHeight();
    const timer = setTimeout(adjustHeight, 320);
    window.addEventListener('resize', adjustHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', adjustHeight);
    };
  }, [open]);

  const currentTagsList = Array.isArray(value) ? value : [];

  // Combine selected tags, user-created tags, and default tags
  const combinedTags = Array.from(new Set([
    ...currentTagsList,
    ...customTags,
    ...DEFAULT_SECTION_TAGS,
  ]));

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTags = combinedTags.filter(t =>
    !normalizedQuery || t.toLowerCase().includes(normalizedQuery)
  );

  const exactMatchExists = combinedTags.some(t => t.toLowerCase() === normalizedQuery);

  const handleToggle = (tag) => {
    if (currentTagsList.includes(tag)) {
      onChange(currentTagsList.filter(t => t !== tag));
    } else {
      onChange([...currentTagsList, tag]);
    }
  };

  const handleCreate = (tagToCreate) => {
    const trimmed = (tagToCreate || searchQuery).trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!customTags.includes(formatted)) {
      setCustomTags(prev => [...prev, formatted]);
    }
    if (!currentTagsList.includes(formatted)) {
      onChange([...currentTagsList, formatted]);
    }
    setSearchQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (normalizedQuery && !exactMatchExists) {
        handleCreate(searchQuery);
      } else if (filteredTags.length > 0) {
        handleToggle(filteredTags[0]);
      }
    }
  };

  const handleToggleOpen = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalOpen(o => !o);
    }
  };

  const triggerLabel = currentTagsList.length === 0
    ? 'Tags'
    : currentTagsList.length === 1
      ? currentTagsList[0]
      : `${currentTagsList.length} Tags`;

  return (
    <div className="sud-dropdown-container" ref={ref}>
      <button
        type="button"
        className={`sud-dropdown-trigger ${open ? 'is-open' : ''}`}
        onClick={handleToggleOpen}
        title="Select Tags"
      >
        <span className="sud-dropdown-value">{triggerLabel}</span>
        <CaretDown size={13} weight="bold" className={`sud-dropdown-caret ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <div className="sud-dropdown-menu" role="dialog" aria-label="Tags selector">
          {/* 1. Search Bar */}
          <div className="sud-dropdown-search-wrap">
            <MagnifyingGlass size={13} weight="bold" className="sud-search-icon" />
            <input
              type="text"
              className="sud-dropdown-search-input"
              placeholder="Search or create tag…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="sud-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>

          {/* 2. Selectable Tags Cloud */}
          <div 
            className="sud-tags-cloud-scroll"
            style={{ maxHeight: `${maxScrollHeight}px` }}
          >
            <div className="sud-tags-cloud">
              {normalizedQuery && !exactMatchExists && (
                <button
                  type="button"
                  className="sud-tag-pill is-create"
                  onClick={() => handleCreate(searchQuery)}
                  title={`Create "${searchQuery.trim()}"`}
                >
                  <Plus size={11} weight="bold" />
                  <span>Create &ldquo;{searchQuery.trim()}&rdquo;</span>
                </button>
              )}

              {filteredTags.map(tag => {
                const isSelected = currentTagsList.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`sud-tag-pill ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleToggle(tag)}
                  >
                    {isSelected && <Check size={11} weight="bold" className="sud-tag-check" />}
                    <span>{tag}</span>
                  </button>
                );
              })}

              {filteredTags.length === 0 && !normalizedQuery && (
                <div className="sud-dropdown-empty">No tags available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadQueueItem({ item, onRemove, onCategoryChange, onTitleChange, onTagsChange }) {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'category' | 'tags' | null

  return (
    <div className="sud-strip-card">
      {/* 1. Media Preview Area */}
      <div className="sud-strip-media-wrap">
        {item.previewUrl ? (
          item.isVideo ? (
            <video 
              src={item.previewUrl} 
              className="sud-strip-media" 
              autoPlay 
              loop 
              muted 
              playsInline 
              preload="auto" 
            />
          ) : (
            <img src={item.previewUrl} alt={item.title || item.category || 'Section preview'} className="sud-strip-media" />
          )
        ) : (
          <div className="sud-strip-placeholder" />
        )}

        {/* Upload progress bar */}
        {item.status === 'uploading' && (
          <div className="sud-strip-progress-bar">
            <div className="sud-strip-progress-fill" style={{ width: `${item.progress}%` }} />
          </div>
        )}

        {/* Remove Button in top-right of media */}
        <button
          type="button"
          className="sud-strip-remove-btn"
          onClick={() => onRemove(item.id)}
          title="Remove"
          aria-label="Remove upload"
        >
          <X size={13} weight="bold" />
        </button>
      </div>

      {/* 2. Integrated Bottom 2-Row Meta Area */}
      <div className="sud-strip-footer">
        {/* Row 1: Full-Width Section Title */}
        <div className="sud-strip-title-row">
          <input
            type="text"
            className="sud-strip-title-input"
            value={item.title || ''}
            onChange={(e) => onTitleChange(item.id, e.target.value)}
            placeholder="Section title…"
            title="Section title"
          />
        </div>

        {/* Row 2: Category Dropdown (Left) + Tags Dropdown (Right) */}
        <div className="sud-strip-utility-row">
          <div className="sud-strip-category-wrap">
            <CategoryDropdown 
              value={item.category} 
              onChange={(cat) => onCategoryChange(item.id, cat)}
              isOpen={activeDropdown === 'category'}
              onToggle={() => setActiveDropdown(curr => curr === 'category' ? null : 'category')}
              onClose={() => setActiveDropdown(curr => curr === 'category' ? null : curr)}
            />
          </div>

          <div className="sud-strip-tags-wrap">
            <TagsDropdown
              value={item.tags || []}
              onChange={(tags) => onTagsChange(item.id, tags)}
              isOpen={activeDropdown === 'tags'}
              onToggle={() => setActiveDropdown(curr => curr === 'tags' ? null : 'tags')}
              onClose={() => setActiveDropdown(curr => curr === 'tags' ? null : curr)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupCollectionCard({
  queue,
  coverItemId,
  onSelectCover,
  onRemoveItem,
  onReorder,
  title,
  onTitleChange,
  category,
  onCategoryChange,
  tags,
  onTagsChange,
  onAddMore,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const activeCover = queue.find(q => q.id === coverItemId) || queue[0];
  const coverIndex = queue.findIndex(q => q.id === activeCover?.id);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
    onReorder(sourceIndex, targetIndex);
  };

  return (
    <div className="sud-strip-card sud-group-collection-card">
      {/* 1. Primary Cover Media Preview */}
      <div className="sud-strip-media-wrap sud-group-cover-wrap">
        {activeCover?.previewUrl ? (
          activeCover.isVideo ? (
            <video
              src={activeCover.previewUrl}
              className="sud-strip-media"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          ) : (
            <img
              src={activeCover.previewUrl}
              alt={title || 'Collection Cover'}
              className="sud-strip-media"
            />
          )
        ) : (
          <div className="sud-strip-placeholder" />
        )}

        {/* Cover Indicator Badge */}
        <div className="sud-cover-pill">
          <span>Cover ({coverIndex >= 0 ? coverIndex + 1 : 1} of {queue.length})</span>
        </div>

        {/* Upload progress bar */}
        {activeCover?.status === 'uploading' && (
          <div className="sud-strip-progress-bar">
            <div className="sud-strip-progress-fill" style={{ width: `${activeCover.progress}%` }} />
          </div>
        )}

        {/* Remove Current Cover button */}
        {activeCover && (
          <button
            type="button"
            className="sud-strip-remove-btn"
            onClick={() => onRemoveItem(activeCover.id)}
            title="Remove from collection"
            aria-label="Remove screenshot"
          >
            <X size={13} weight="bold" />
          </button>
        )}
      </div>

      {/* 2. Collection Thumbnail Filmstrip Reel */}
      <div className="sud-collection-reel-section">
        <div className="sud-collection-reel-header">
          <span className="sud-collection-reel-title">
            Screens in Collection ({queue.length})
          </span>
          <span className="sud-collection-reel-hint">
            Click to set cover • Drag to reorder
          </span>
        </div>

        <div className="sud-collection-reel">
          {queue.map((item, idx) => {
            const isCover = item.id === activeCover?.id;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                className={`sud-collection-chip ${isCover ? 'is-cover' : ''}`}
                onClick={() => onSelectCover(item.id)}
                title={isCover ? 'Current Cover Image' : `Set screen ${idx + 1} as Cover`}
              >
                {item.previewUrl ? (
                  item.isVideo ? (
                    <video src={item.previewUrl} className="sud-chip-media" muted playsInline />
                  ) : (
                    <img src={item.previewUrl} alt={item.title || `Screen ${idx + 1}`} className="sud-chip-media" />
                  )
                ) : (
                  <div className="sud-chip-placeholder" />
                )}

                {isCover && (
                  <span className="sud-chip-star" title="Cover Image">
                    <Star size={10} weight="fill" />
                  </span>
                )}

                <span className="sud-chip-index">{idx + 1}</span>

                {queue.length > 1 && (
                  <button
                    type="button"
                    className="sud-chip-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    title="Remove screen"
                  >
                    <X size={9} weight="bold" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            className="sud-collection-add-chip"
            onClick={onAddMore}
            title="Add more screenshots to collection"
          >
            <Plus size={14} weight="bold" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 3. Integrated Bottom 2-Row Meta Area */}
      <div className="sud-strip-footer">
        {/* Row 1: Full-Width Collection Title */}
        <div className="sud-strip-title-row">
          <input
            type="text"
            className="sud-strip-title-input"
            value={title || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Collection title (e.g. Dashboard Suite)…"
            title="Collection title"
          />
        </div>

        {/* Row 2: Category Dropdown (Left) + Tags Dropdown (Right) */}
        <div className="sud-strip-utility-row">
          <div className="sud-strip-category-wrap">
            <CategoryDropdown
              value={category}
              onChange={onCategoryChange}
              isOpen={activeDropdown === 'category'}
              onToggle={() => setActiveDropdown(curr => curr === 'category' ? null : 'category')}
              onClose={() => setActiveDropdown(curr => curr === 'category' ? null : curr)}
            />
          </div>

          <div className="sud-strip-tags-wrap">
            <TagsDropdown
              value={tags || []}
              onChange={onTagsChange}
              isOpen={activeDropdown === 'tags'}
              onToggle={() => setActiveDropdown(curr => curr === 'tags' ? null : 'tags')}
              onClose={() => setActiveDropdown(curr => curr === 'tags' ? null : curr)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Drawer
// ─────────────────────────────────────────────

export default function SectionUploadDrawer({ isOpen, onClose, onUploadSuccess, initialSection }) {
  const { user } = useAuth ? useAuth() : { user: null };

  const [queue, setQueue] = useState([]);         // Array of upload items
  const [isGroupMode, setIsGroupMode] = useState(false); // Option A: Group into collection toggle
  const [coverItemId, setCoverItemId] = useState(null);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionCategory, setCollectionCategory] = useState('Hero');
  const [collectionTags, setCollectionTags] = useState([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const fileInputRef = useRef(null);
  const cancelledRef = useRef(new Set());

  const isDirty = initialSection 
    ? true 
    : (queue.length > 0 || websiteUrl.trim() || tags.trim() || description.trim() || collectionTitle.trim());
  const allDone = queue.length > 0 && queue.every(q => q.status === 'done' || q.status === 'error');
  const hasPublishable = queue.some(q => q.status === 'done' && q.imageUrl);

  // Initialize from initialSection OR restore draft from IndexedDB
  useEffect(() => {
    if (initialSection) {
      const cleanTitle = (initialSection.section_title || initialSection.section_type || 'Section').replace(/\.[^/.]+$/, '').trim();
      const isVideo = typeof initialSection.image_url === 'string' && (
        initialSection.image_url.endsWith('.mp4') || initialSection.image_url.endsWith('.webm') || initialSection.image_url.endsWith('.mov')
      );
      const initTags = Array.isArray(initialSection.tags) 
        ? initialSection.tags 
        : (initialSection.tags ? initialSection.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

      const hasGroupMedia = Array.isArray(initialSection.media) && initialSection.media.length > 0;
      if (hasGroupMedia) {
        setIsGroupMode(true);
        setCollectionTitle(cleanTitle);
        setCollectionCategory(initialSection.section_type || 'Hero');
        setCollectionTags(initTags);
        const mappedQueue = initialSection.media.map((m, idx) => ({
          id: `edit-media-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          file: null,
          hash: `existing-${idx}`,
          filename: m.filename || m.title || `screen-${idx + 1}`,
          title: m.title || `Screen ${idx + 1}`,
          category: m.category || initialSection.section_type || 'Hero',
          tags: Array.isArray(m.tags) ? m.tags : initTags,
          isVideo: Boolean(m.isVideo || (typeof m.url === 'string' && (m.url.endsWith('.mp4') || m.url.endsWith('.webm')))),
          previewUrl: m.url || m.thumbnailUrl,
          status: 'done',
          progress: 100,
          imageUrl: m.url,
          thumbnailUrl: m.thumbnailUrl || m.url,
          errorMsg: '',
          isClassifying: false,
        }));
        setQueue(mappedQueue);
        const coverIdx = initialSection.media.findIndex(m => m.isCover);
        const coverItem = (coverIdx >= 0 ? mappedQueue[coverIdx] : mappedQueue[0]);
        setCoverItemId(coverItem?.id || null);
      } else {
        setIsGroupMode(false);
        setCollectionTitle('');
        setCollectionCategory(initialSection.section_type || 'Hero');
        setCollectionTags([]);
        setCoverItemId('edit-item');
        setQueue([{
          id: initialSection.id || 'edit-item',
          file: null,
          hash: 'existing',
          filename: initialSection.section_title || 'section',
          title: cleanTitle,
          category: initialSection.section_type || 'Hero',
          tags: initTags,
          isVideo,
          previewUrl: initialSection.image_url || initialSection.thumbnail_url,
          status: 'done',
          progress: 100,
          imageUrl: initialSection.image_url || initialSection.thumbnail_url,
          thumbnailUrl: initialSection.thumbnail_url || initialSection.image_url,
          errorMsg: '',
          isClassifying: false,
        }]);
      }
      setWebsiteUrl(initialSection.page_url || initialSection.website_url || '');
      setTags(Array.isArray(initialSection.tags) ? initialSection.tags.join(', ') : (initialSection.tags || ''));
      setDescription(initialSection.description || '');
      setErrorMsg('');
      setHasLoadedDraft(true);
    } else {
      // Restore draft from IndexedDB
      let isMounted = true;
      loadDraft('section_upload_draft').then(saved => {
        if (!isMounted || !saved) {
          setHasLoadedDraft(true);
          return;
        }
        const hasItems = Array.isArray(saved.queue) && saved.queue.length > 0;
        const hasFields = Boolean(
          saved.websiteUrl?.trim() ||
          saved.tags?.trim() ||
          saved.description?.trim() ||
          saved.collectionTitle?.trim()
        );
        if (hasItems || hasFields) {
          setQueue(saved.queue || []);
          setIsGroupMode(Boolean(saved.isGroupMode));
          setCoverItemId(saved.coverItemId || (saved.queue?.[0]?.id || null));
          setCollectionTitle(saved.collectionTitle || '');
          setCollectionCategory(saved.collectionCategory || 'Hero');
          setCollectionTags(Array.isArray(saved.collectionTags) ? saved.collectionTags : []);
          setWebsiteUrl(saved.websiteUrl || '');
          setTags(saved.tags || '');
          setDescription(saved.description || '');
        }
        setHasLoadedDraft(true);
      });
      return () => { isMounted = false; };
    }
  }, [initialSection]);

  // Auto-save draft changes to IndexedDB
  useEffect(() => {
    if (initialSection || !hasLoadedDraft) return;

    const hasContent = queue.length > 0 ||
      Boolean(websiteUrl.trim()) ||
      Boolean(tags.trim()) ||
      Boolean(description.trim()) ||
      Boolean(collectionTitle.trim());

    if (!hasContent) {
      clearDraft('section_upload_draft');
      return;
    }

    const timer = setTimeout(() => {
      saveDraft('section_upload_draft', {
        queue,
        isGroupMode,
        coverItemId,
        collectionTitle,
        collectionCategory,
        collectionTags,
        websiteUrl,
        tags,
        description,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [
    initialSection,
    hasLoadedDraft,
    queue,
    isGroupMode,
    coverItemId,
    collectionTitle,
    collectionCategory,
    collectionTags,
    websiteUrl,
    tags,
    description,
  ]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // ESC to close (preserves draft without prompt)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          handleCloseDrawer();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isSubmitting, showDiscardConfirm]);

  const resetForm = () => {
    setQueue([]);
    setIsGroupMode(false);
    setCoverItemId(null);
    setCollectionTitle('');
    setCollectionCategory('Hero');
    setCollectionTags([]);
    setWebsiteUrl('');
    setTags('');
    setDescription('');
    setErrorMsg('');
    setShowDiscardConfirm(false);
    cancelledRef.current.clear();
  };

  // Regular close (backdrop, X, ESC) preserves draft completely
  const handleCloseDrawer = () => {
    if (isSubmitting) return;
    onClose();
  };

  // Cancel button handler: confirms before discarding unfinished draft
  const handleCancelClick = () => {
    if (isSubmitting) return;
    if (isDirty && !initialSection) {
      setShowDiscardConfirm(true);
    } else {
      handleCloseDrawer();
    }
  };

  // Explicit discard confirmation handler
  const handleConfirmDiscard = async () => {
    setShowDiscardConfirm(false);
    await clearDraft('section_upload_draft');
    resetForm();
    onClose();
  };

  // ── File processing ──
  const processFiles = useCallback(async (files) => {
    setErrorMsg('');
    const candidates = Array.from(files).filter(f => {
      if (!ALL_VALID_TYPES.includes(f.type)) {
        setErrorMsg('Unsupported type. Please upload PNG, JPG, WEBP, GIF, AVIF, or MP4/WEBM/MOV video.');
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrorMsg(`File too large. Max ${MAX_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });
    if (!candidates.length) return;

    // Build initial queue entries: preserve original filename by default
    const newItems = await Promise.all(candidates.map(async (file) => {
      const hash = await computeFileHash(file);
      // Clean extension to preserve original filename 1:1 as default title
      const defaultTitle = file.name.replace(/\.[^/.]+$/, '').trim();
      const classified = classifySection(defaultTitle);
      const isVideo = isVideoFile(file);

      return {
        id: Math.random().toString(36).slice(2),
        file,
        hash,
        filename: file.name,
        title: defaultTitle || 'Section',
        category: classified?.category || 'Hero',
        tags: Array.isArray(classified?.tags) ? classified.tags : [],
        isVideo,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading',
        progress: 5,
        imageUrl: '',
        thumbnailUrl: '',
        errorMsg: '',
        isClassifying: false,
      };
    }));

    // Deduplicate by hash
    setQueue(prev => {
      const existingHashes = new Set(prev.map(q => q.hash));
      const unique = newItems.filter(i => !existingHashes.has(i.hash));
      if (unique.length < newItems.length) setErrorMsg('Duplicate files skipped.');
      return [...prev, ...unique];
    });

    // Process each file (Upload immediately, AI remains strictly OFF by default)
    newItems.forEach(item => processItem(item));
  }, []);

  const processItem = async (item) => {
    if (cancelledRef.current.has(item.id)) return;
    if (item.status === 'done' && item.imageUrl) return;
    if (!item.file) return;

    // Step 1: Upload full file to Supabase storage
    const fileExt = item.file.name.split('.').pop() || (item.isVideo ? 'mp4' : 'png');
    const uniqueSlug = Math.random().toString(36).slice(2, 8);
    const safeTitle = (item.title || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    const filePath = `sections/${safeTitle}-${uniqueSlug}.${fileExt}`;

    const uploadResult = await uploadWithProgress(item.file, 'submissions', filePath, (pct) => {
      if (!cancelledRef.current.has(item.id)) {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: Math.max(5, pct) } : q));
      }
    });

    if (cancelledRef.current.has(item.id)) return;
    if (uploadResult.error) {
      setQueue(prev => prev.map(q => q.id === item.id
        ? { ...q, status: 'error', errorMsg: uploadResult.error.message || 'Upload failed' }
        : q
      ));
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(filePath);

    // Step 2: Auto-generate 16:10 thumbnail (skip for animated images to preserve animation)
    let thumbnailUrl = publicUrl;
    if (!isAnimatedFile(item.file)) {
      try {
        const autoThumb = item.isVideo 
          ? await generateVideoThumbnail(item.file)
          : await generateAutoThumbnail(item.file);

        if (autoThumb && !cancelledRef.current.has(item.id)) {
          const thumbPath = `thumbnails/thumb-${safeTitle}-${uniqueSlug}.jpg`;
          const thumbResult = await uploadWithProgress(autoThumb.file, 'submissions', thumbPath, () => {});
          if (!thumbResult.error) {
            const { data: { publicUrl: thumbPub } } = supabase.storage.from('submissions').getPublicUrl(thumbPath);
            thumbnailUrl = thumbPub;
          }
        }
      } catch (err) {
        console.warn('[SectionUploadDrawer] Thumbnail warning:', err);
      }
    }

    if (cancelledRef.current.has(item.id)) return;

    setQueue(prev => prev.map(q => q.id === item.id
      ? { ...q, status: 'done', progress: 100, imageUrl: publicUrl, thumbnailUrl }
      : q
    ));
  };

  // Manual trigger for Gemini AI categorization (only runs on user request)
  const handleClassifyAI = async (id) => {
    const item = queue.find(q => q.id === id);
    if (!item || item.isVideo) return;

    setQueue(prev => prev.map(q => q.id === id ? { ...q, isClassifying: true } : q));
    const aiCategory = await analyzeWithGemini(item.file);
    setQueue(prev => prev.map(q => q.id === id ? {
      ...q,
      isClassifying: false,
      category: aiCategory || q.category
    } : q));
  };

  const removeItem = (id) => {
    cancelledRef.current.add(id);
    setQueue(prev => {
      const item = prev.find(q => q.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      const remaining = prev.filter(q => q.id !== id);
      if (coverItemId === id) {
        setCoverItemId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  const handleReorderCollection = (sourceIndex, targetIndex) => {
    setQueue(prev => {
      if (sourceIndex < 0 || sourceIndex >= prev.length || targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(sourceIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  const updateCategory = (id, category) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, category } : q));
  };

  const updateTitle = (id, title) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, title } : q));
  };

  const updateTags = (id, tags) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, tags } : q));
  };

  // ── Save Draft or Publish ──
  const handleSubmit = async (targetStatus = 'Approved') => {
    const publishable = queue.filter(q => q.status === 'done' && q.imageUrl);
    if (!publishable.length) return;

    setIsSubmitting(true);
    setErrorMsg('');

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      // ── Group Mode: Publish or Edit as 1 Unified Collection Record ──
      if (isGroupMode && publishable.length > 0) {
        const coverItem = publishable.find(q => q.id === coverItemId) || publishable[0];
        const finalTitle = (collectionTitle || coverItem.title || coverItem.filename?.replace(/\.[^/.]+$/, '') || 'Collection').trim();
        const finalCategory = collectionCategory || coverItem.category || 'Hero';
        const finalGroupTags = (Array.isArray(collectionTags) && collectionTags.length > 0)
          ? collectionTags
          : tagList;

        const mediaItems = publishable.map(item => ({
          url: item.imageUrl,
          thumbnailUrl: item.thumbnailUrl || item.imageUrl,
          title: item.title || item.filename?.replace(/\.[^/.]+$/, '') || 'Screen',
          category: item.category || finalCategory,
          tags: (Array.isArray(item.tags) && item.tags.length > 0) ? item.tags : finalGroupTags,
          isVideo: item.isVideo || false,
          filename: item.filename || '',
          isCover: item.id === coverItem.id
        }));

        if (initialSection?.id) {
          const updatePayload = {
            section_type: finalCategory,
            section_title: finalTitle,
            image_url: coverItem.imageUrl || initialSection.image_url,
            thumbnail_url: coverItem.thumbnailUrl || initialSection.thumbnail_url || coverItem.imageUrl,
            page_url: websiteUrl.trim() || null,
            website_url: websiteUrl.trim() || null,
            tags: finalGroupTags,
            description: description.trim() || null,
            status: targetStatus,
            media: mediaItems,
          };

          const { error } = await supabase
            .from('website_sections')
            .update(updatePayload)
            .eq('id', initialSection.id);

          if (error) throw error;

          if (onUploadSuccess) {
            onUploadSuccess({ 
              count: 1, 
              status: targetStatus, 
              isEdit: true, 
              updatedSection: { ...initialSection, ...updatePayload } 
            });
          }
          resetForm();
          onClose();
          return;
        }

        const groupInsert = {
          section_type: finalCategory,
          section_title: finalTitle,
          image_url: coverItem.imageUrl,
          thumbnail_url: coverItem.thumbnailUrl || coverItem.imageUrl,
          page_url: websiteUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          tags: finalGroupTags,
          description: description.trim() || null,
          is_standalone: true,
          status: targetStatus,
          submitted_by: user?.id || null,
          sort_order: 0,
          website_id: null,
          media: mediaItems,
        };

        const { error } = await supabase.from('website_sections').insert([groupInsert]);
        if (error) throw error;

        if (onUploadSuccess) onUploadSuccess({ count: 1, status: targetStatus });
        await clearDraft('section_upload_draft');
        resetForm();
        onClose();
        return;
      }

      // ── Standalone Mode: Publish or Edit as Individual Records ──
      if (initialSection?.id) {
        const item = publishable[0];
        const finalTags = (Array.isArray(item.tags) && item.tags.length > 0)
          ? item.tags
          : tagList;

        const updatePayload = {
          section_type: item.category || 'Hero',
          section_title: (item.title || item.filename?.replace(/\.[^/.]+$/, '') || '').trim() || 'Section',
          image_url: item.imageUrl || initialSection.image_url,
          thumbnail_url: item.thumbnailUrl || initialSection.thumbnail_url || item.imageUrl,
          page_url: websiteUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          tags: finalTags,
          description: description.trim() || null,
          status: targetStatus,
        };

        const { error } = await supabase
          .from('website_sections')
          .update(updatePayload)
          .eq('id', initialSection.id);

        if (error) throw error;

        if (onUploadSuccess) {
          onUploadSuccess({ 
            count: 1, 
            status: targetStatus, 
            isEdit: true, 
            updatedSection: { ...initialSection, ...updatePayload } 
          });
        }
        resetForm();
        onClose();
        return;
      }

      const inserts = publishable.map(item => {
        const itemTags = (Array.isArray(item.tags) && item.tags.length > 0)
          ? item.tags
          : tagList;

        return {
          section_type: item.category || 'Hero',
          section_title: (item.title || item.filename.replace(/\.[^/.]+$/, '')).trim() || 'Section',
          image_url: item.imageUrl,
          thumbnail_url: item.thumbnailUrl || item.imageUrl,
          page_url: websiteUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          tags: itemTags,
          description: description.trim() || null,
          is_standalone: true,
          status: targetStatus, // 'Approved' for published, 'Draft' for draft
          submitted_by: user?.id || null,
          sort_order: 0,
          website_id: null,
          media: [],
        };
      });

      const { error } = await supabase.from('website_sections').insert(inserts);
      if (error) throw error;

      if (onUploadSuccess) onUploadSuccess({ count: inserts.length, status: targetStatus });
      await clearDraft('section_upload_draft');
      resetForm();
      onClose();
    } catch (err) {
      console.error('[SectionUploadDrawer] Submit error:', err);
      setErrorMsg(err.message || 'Failed to save sections. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Drag & drop ──
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  // ── Global paste handler (Ctrl+V / Cmd+V) ──
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowPaste = (e) => {
      // Don't intercept if user is typing text into an input or textarea and clipboard has only text
      const target = e.target;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      const items = e.clipboardData?.items;
      const files = [];

      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
            const blob = item.getAsFile();
            if (blob) {
              const ext = (item.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
              const cleanName = (blob.name && blob.name !== 'image.png' && blob.name !== 'blob')
                ? blob.name
                : `screenshot-${Date.now()}.${ext}`;
              const file = new File([blob], cleanName, { type: blob.type });
              files.push(file);
            }
          }
        }
      }

      // Fallback to clipboardData.files
      if (files.length === 0 && e.clipboardData?.files?.length) {
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const f = e.clipboardData.files[i];
          if (f.type.startsWith('image/') || f.type.startsWith('video/')) {
            files.push(f);
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        processFiles(files);
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [isOpen, processFiles]);

  // ── Click-to-paste button handler ──
  const handlePasteFromClipboard = async () => {
    setErrorMsg('');
    try {
      if (!navigator.clipboard?.read) {
        setErrorMsg('Clipboard API not supported in this browser. Please use Cmd+V / Ctrl+V.');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      const files = [];
      for (const item of clipboardItems) {
        const imageType = item.types.find(t => t.startsWith('image/') || t.startsWith('video/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = (imageType.split('/')[1] || 'png').replace('jpeg', 'jpg');
          const file = new File([blob], `screenshot-${Date.now()}.${ext}`, { type: imageType });
          files.push(file);
        }
      }
      if (files.length > 0) {
        processFiles(files);
      } else {
        setErrorMsg('No image found on clipboard. Copy an image or screenshot first, then click Paste.');
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
      setErrorMsg('Could not access clipboard. Please press Cmd+V / Ctrl+V to paste directly.');
    }
  };

  if (!isOpen) return null;

  const publishableCount = queue.filter(q => q.status === 'done' && q.imageUrl).length;

  const drawer = (
    <div className="sud-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) handleCloseDrawer(); }}>
      <aside className="sud-panel" role="dialog" aria-modal="true" aria-labelledby="sud-title">
        {/* Header */}
        <div className="sud-header">
          <div className="sud-header-left">
            <h2 id="sud-title" className="sud-title">{initialSection ? 'Edit Section' : 'Upload Section'}</h2>
            <p className="sud-subtitle">
              {initialSection 
                ? 'Update section details, category, and metadata.' 
                : 'Add screenshots or recordings to the Sections library.'}
            </p>
          </div>
          <button type="button" className="sud-close-btn" onClick={handleCloseDrawer} disabled={isSubmitting}>
            <X size={17} weight="bold" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="sud-body">
          {errorMsg && <div className="sud-error-banner">{errorMsg}</div>}

          {/* Dropzone & Header with Micro-Toggle */}
          <div className="sud-section">
            <div className="sud-files-header-row">
              <label className="sud-label">
                Files <span className="sud-required">*</span>
              </label>
              <div 
                className={`sud-group-toggle-wrap ${isGroupMode ? 'is-active' : ''}`}
                onClick={() => setIsGroupMode(g => !g)}
                title="Toggle grouping all files into one collection"
              >
                <span className="sud-group-toggle-label">Group into collection</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isGroupMode}
                  className={`sud-group-toggle-btn ${isGroupMode ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGroupMode(g => !g);
                  }}
                  title="Toggle group mode"
                >
                  <span className="sud-group-toggle-thumb" />
                </button>
              </div>
            </div>
            <div
              className={`sud-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="sud-dropzone-circle">
                <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z" />
                </svg>
              </div>
              <p className="sud-dropzone-main">Drop or click to upload</p>
              <p className="sud-dropzone-sub">PNG, JPG, WebP · Paste with Ctrl+V / Cmd+V</p>
            </div>
            <div className="sud-paste-row">
              <button
                type="button"
                className="sud-paste-btn"
                onClick={handlePasteFromClipboard}
                title="Paste image from clipboard (Cmd+V)"
              >
                <ClipboardText size={15} weight="bold" />
                <span>Paste · ⌘V or click</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,video/ogg,video/x-m4v"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = null; }}
            />
          </div>

          {/* Upload queue: Switch between Group Collection Card vs Standalone List */}
          {queue.length > 0 && (
            <div className="sud-section">
              <div className="sud-queue-header">
                <label className="sud-label">
                  {isGroupMode ? `Collection (${queue.length} screens)` : `Uploads (${queue.length})`}
                </label>
                <button type="button" className="sud-add-more" onClick={() => fileInputRef.current?.click()}>
                  + Add more
                </button>
              </div>

              {isGroupMode ? (
                <GroupCollectionCard
                  queue={queue}
                  coverItemId={coverItemId}
                  onSelectCover={(id) => setCoverItemId(id)}
                  onRemoveItem={removeItem}
                  onReorder={handleReorderCollection}
                  title={collectionTitle}
                  onTitleChange={setCollectionTitle}
                  category={collectionCategory}
                  onCategoryChange={setCollectionCategory}
                  tags={collectionTags}
                  onTagsChange={setCollectionTags}
                  onAddMore={() => fileInputRef.current?.click()}
                />
              ) : (
                <div className="sud-queue-list">
                  {queue.map(item => (
                    <UploadQueueItem
                      key={item.id}
                      item={item}
                      onRemove={removeItem}
                      onCategoryChange={updateCategory}
                      onTitleChange={updateTitle}
                      onTagsChange={updateTags}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Website URL */}
          <div className="sud-section">
            <label className="sud-label">
              Website URL <span className="sud-optional">(Optional)</span>
            </label>
            <div className="sud-input-wrap">
              <svg width="15" height="15" viewBox="0 0 256 256" fill="currentColor" className="sud-input-icon">
                <path d="M87.5,151.52l64-64a12,12,0,0,1,17,17l-64,64a12,12,0,0,1-17-17Zm131-114a60.08,60.08,0,0,0-84.87,0L103.51,67.61a12,12,0,0,0,17,17l30.07-30.06a36,36,0,0,1,50.93,50.92L171.4,135.52a12,12,0,1,0,17,17l30.08-30.06A60.09,60.09,0,0,0,218.45,37.55ZM135.52,171.4l-30.07,30.08a36,36,0,0,1-50.92-50.93l30.06-30.07a12,12,0,0,0-17-17L37.55,133.58a60,60,0,0,0,84.88,84.87l30.06-30.07a12,12,0,0,0-17-17Z" />
              </svg>
              <input
                type="url"
                className="sud-input"
                placeholder="https://stripe.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="sud-section">
            <label className="sud-label">
              Tags <span className="sud-optional">(Optional, comma-separated)</span>
            </label>
            <div className="sud-input-wrap">
              <svg width="15" height="15" viewBox="0 0 256 256" fill="currentColor" className="sud-input-icon">
                <path d="M246.15,133.18,146.83,33.86A19.85,19.85,0,0,0,132.69,28H40A12,12,0,0,0,28,40v92.69a19.85,19.85,0,0,0,5.86,14.14l99.32,99.32a20,20,0,0,0,28.28,0l84.69-84.69A20,20,0,0,0,246.15,133.18Zm-98.83,93.17L52,131V52h79l95.32,95.32ZM104,88A16,16,0,1,1,88,72,16,16,0,0,1,104,88Z" />
              </svg>
              <input
                type="text"
                className="sud-input"
                placeholder="dark mode, gradient, split layout"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="sud-section">
            <label className="sud-label">
              Description <span className="sud-optional">(Optional)</span>
            </label>
            <textarea
              className="sud-textarea"
              placeholder="What makes this section notable?"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sud-footer">
          <button type="button" className="sud-cancel-btn" onClick={handleCancelClick} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            className="sud-submit-btn"
            onClick={() => handleSubmit('Approved')}
            disabled={isSubmitting || !hasPublishable}
          >
            {isSubmitting
              ? <span>Saving…</span>
              : initialSection
                ? <><Sparkle size={14} weight="fill" /> Save Changes</>
                : isGroupMode
                  ? <><Sparkle size={14} weight="fill" /> Publish Collection ({publishableCount})</>
                  : <><Sparkle size={14} weight="fill" /> Publish Section{publishableCount > 1 ? 's' : ''}</>
            }
          </button>
        </div>

        {/* Discard Draft Confirmation Modal */}
        {showDiscardConfirm && (
          <div className="sud-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="sud-confirm-title">
            <div className="sud-confirm-card">
              <h3 id="sud-confirm-title" className="sud-confirm-title">Discard unfinished draft?</h3>
              <p className="sud-confirm-desc">
                You have uploaded media and draft details. Discarding will permanently remove this draft.
              </p>
              <div className="sud-confirm-actions">
                <button
                  type="button"
                  className="sud-confirm-keep-btn"
                  onClick={() => setShowDiscardConfirm(false)}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  className="sud-confirm-discard-btn"
                  onClick={handleConfirmDiscard}
                >
                  Discard Draft
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawer, document.body) : drawer;
}
