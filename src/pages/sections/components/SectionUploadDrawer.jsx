import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, CaretDown, Sparkle } from '@phosphor-icons/react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { uploadWithProgress } from '../../../utils/uploadXHR';
import { sanitizeSectionName } from '../../admin/components/PageMediaUploader';
import { ALL_SECTION_CATEGORIES, GEMINI_SECTION_CATEGORIES } from '../../../data/section-categories';
import './section-upload-drawer.css';

// ─────────────────────────────────────────────
// Helpers (reused from PageMediaUploader)
// ─────────────────────────────────────────────

const MAX_SIZE_MB = 100;

const compressImageForAI = (file, maxDimension = 1280, quality = 0.8) =>
  new Promise((resolve) => {
    if (!file?.type?.startsWith('image/') || file.type.includes('svg')) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension && file.size < 600 * 1024) return resolve(file);
      if (width > height) { if (width > maxDimension) { height = Math.round((height * maxDimension) / width); width = maxDimension; } }
      else { if (height > maxDimension) { width = Math.round((width * maxDimension) / height); height = maxDimension; } }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

const generateAutoThumbnail = (file, targetRatio = 16 / 10) =>
  new Promise((resolve) => {
    if (!file?.type?.startsWith('image/') || file.type.includes('svg')) return resolve(null);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const cropW = naturalW;
      const cropH = Math.min(naturalH, Math.round(naturalW / targetRatio));
      const canvas = document.createElement('canvas');
      canvas.width = 1280; canvas.height = Math.round(1280 / targetRatio);
      canvas.getContext('2d').drawImage(img, 0, 0, cropW, cropH, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) resolve({ file: new File([blob], `thumb-${file.name}`, { type: 'image/jpeg' }), cropData: { yPercent: 0, heightPercent: (cropH / naturalH) * 100 } });
        else resolve(null);
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
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

function CategoryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="sud-dropdown-container" ref={ref}>
      <button
        type="button"
        className={`sud-dropdown-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="sud-dropdown-value">{value || 'Select category…'}</span>
        <CaretDown size={13} weight="bold" className={`sud-dropdown-caret ${open ? 'is-open' : ''}`} />
      </button>
      {open && (
        <div className="sud-dropdown-menu">
          {ALL_SECTION_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`sud-dropdown-item ${value === cat ? 'selected' : ''}`}
              onClick={() => { onChange(cat); setOpen(false); }}
            >
              <span>{cat}</span>
              {value === cat && <Check size={13} weight="bold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadQueueItem({ item, onRemove, onCategoryChange }) {
  return (
    <div className="sud-queue-item">
      <div className="sud-queue-thumb">
        {item.previewUrl
          ? <img src={item.previewUrl} alt={item.filename} className="sud-queue-thumb-img" />
          : <div className="sud-queue-thumb-placeholder" />}
        {item.status === 'analyzing' && <div className="sud-queue-badge">✦ AI</div>}
        {item.status === 'uploading' && (
          <div className="sud-queue-progress-bar">
            <div className="sud-queue-progress-fill" style={{ width: `${item.progress}%` }} />
          </div>
        )}
        {item.status === 'done' && <div className="sud-queue-badge sud-queue-badge--done">✓</div>}
        {item.status === 'error' && <div className="sud-queue-badge sud-queue-badge--error">!</div>}
      </div>

      <div className="sud-queue-meta">
        <div className="sud-queue-filename" title={item.filename}>{item.filename}</div>
        {item.status === 'analyzing' && <div className="sud-queue-status">Classifying with AI…</div>}
        {item.status === 'uploading' && <div className="sud-queue-status">Uploading {item.progress}%…</div>}
        {item.status === 'done' && (
          <CategoryDropdown value={item.category} onChange={(cat) => onCategoryChange(item.id, cat)} />
        )}
        {item.status === 'error' && <div className="sud-queue-status sud-queue-status--error">{item.errorMsg || 'Upload failed'}</div>}
        {item.status === 'waiting' && <div className="sud-queue-status">Waiting…</div>}
      </div>

      <button type="button" className="sud-queue-remove" onClick={() => onRemove(item.id)} title="Remove">
        <X size={14} weight="bold" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Drawer
// ─────────────────────────────────────────────

export default function SectionUploadDrawer({ isOpen, onClose, onUploadSuccess }) {
  const { user } = useAuth ? useAuth() : { user: null };

  const [queue, setQueue] = useState([]);         // Array of upload items
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const cancelledRef = useRef(new Set());

  const isDirty = queue.length > 0 || websiteUrl.trim() || tags.trim() || description.trim();
  const allDone = queue.length > 0 && queue.every(q => q.status === 'done' || q.status === 'error');
  const hasPublishable = queue.some(q => q.status === 'done');

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) attemptClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isSubmitting, isDirty]);

  const resetForm = () => {
    setQueue([]);
    setWebsiteUrl('');
    setTags('');
    setDescription('');
    setErrorMsg('');
    cancelledRef.current.clear();
  };

  const forceClose = () => { resetForm(); onClose(); };

  const attemptClose = () => {
    if (isSubmitting) return;
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Discard and close?')) forceClose();
    } else {
      forceClose();
    }
  };

  // ── File processing ──
  const processFiles = useCallback(async (files) => {
    setErrorMsg('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const candidates = Array.from(files).filter(f => {
      if (!validTypes.includes(f.type)) { setErrorMsg('Unsupported type. Please upload PNG, JPG, or WEBP.'); return false; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { setErrorMsg(`File too large. Max ${MAX_SIZE_MB}MB.`); return false; }
      return true;
    });
    if (!candidates.length) return;

    // Build initial queue entries
    const newItems = await Promise.all(candidates.map(async (file) => {
      const hash = await computeFileHash(file);
      return {
        id: Math.random().toString(36).slice(2),
        file,
        hash,
        filename: file.name,
        previewUrl: URL.createObjectURL(file),
        status: 'analyzing',
        progress: 0,
        category: '',
        imageUrl: '',
        thumbnailUrl: '',
        errorMsg: '',
      };
    }));

    // Deduplicate by hash
    setQueue(prev => {
      const existingHashes = new Set(prev.map(q => q.hash));
      const unique = newItems.filter(i => !existingHashes.has(i.hash));
      if (unique.length < newItems.length) setErrorMsg('Duplicate files skipped.');
      return [...prev, ...unique];
    });

    // Process each file
    newItems.forEach(item => processItem(item));
  }, []);

  const processItem = async (item) => {
    // Step 1: AI classification
    const aiCategory = await analyzeWithGemini(item.file);

    if (cancelledRef.current.has(item.id)) return;

    setQueue(prev => prev.map(q => q.id === item.id
      ? { ...q, status: 'uploading', category: aiCategory || 'Hero', progress: 5 }
      : q
    ));

    // Step 2: Upload full screenshot
    const fileExt = item.file.name.split('.').pop() || 'png';
    const uniqueSlug = Math.random().toString(36).slice(2, 7);
    const categorySlug = (aiCategory || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filePath = `sections/${categorySlug}-${uniqueSlug}.${fileExt}`;

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

    // Step 3: Auto-generate thumbnail
    let thumbnailUrl = publicUrl;
    const autoThumb = await generateAutoThumbnail(item.file);
    if (autoThumb && !cancelledRef.current.has(item.id)) {
      const thumbPath = `thumbnails/thumb-${categorySlug}-${uniqueSlug}.jpg`;
      const thumbResult = await uploadWithProgress(autoThumb.file, 'submissions', thumbPath, () => {});
      if (!thumbResult.error) {
        const { data: { publicUrl: thumbPub } } = supabase.storage.from('submissions').getPublicUrl(thumbPath);
        thumbnailUrl = thumbPub;
      }
    }

    if (cancelledRef.current.has(item.id)) return;

    setQueue(prev => prev.map(q => q.id === item.id
      ? { ...q, status: 'done', progress: 100, imageUrl: publicUrl, thumbnailUrl, category: aiCategory || 'Hero' }
      : q
    ));
  };

  const removeItem = (id) => {
    cancelledRef.current.add(id);
    setQueue(prev => {
      const item = prev.find(q => q.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(q => q.id !== id);
    });
  };

  const updateCategory = (id, category) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, category } : q));
  };

  // ── Publish ──
  const handlePublish = async (e) => {
    e.preventDefault();
    const publishable = queue.filter(q => q.status === 'done' && q.imageUrl);
    if (!publishable.length) return;

    setIsSubmitting(true);
    setErrorMsg('');

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin';
    const status = isAdmin ? 'Approved' : 'Pending';

    try {
      const inserts = publishable.map(item => ({
        section_type: item.category,
        section_title: item.category,
        image_url: item.imageUrl,
        thumbnail_url: item.thumbnailUrl || item.imageUrl,
        page_url: websiteUrl.trim() || null,
        website_url: websiteUrl.trim() || null,
        tags: tagList,
        description: description.trim() || null,
        is_standalone: true,
        status,
        submitted_by: user?.id || null,
        sort_order: 0,
        // website_id is intentionally null for standalone sections
      }));

      const { error } = await supabase.from('website_sections').insert(inserts);
      if (error) throw error;

      if (onUploadSuccess) onUploadSuccess({ count: inserts.length, status });
      forceClose();
    } catch (err) {
      console.error('[SectionUploadDrawer] Publish error:', err);
      setErrorMsg(err.message || 'Failed to publish. Please try again.');
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

  if (!isOpen) return null;

  const drawer = (
    <div className="sud-backdrop" onClick={(e) => { if (e.target === e.currentTarget) attemptClose(); }}>
      <aside className="sud-panel" role="dialog" aria-modal="true" aria-labelledby="sud-title">
        {/* Header */}
        <div className="sud-header">
          <div className="sud-header-left">
            <h2 id="sud-title" className="sud-title">Upload Section</h2>
            <p className="sud-subtitle">Add screenshots to the Sections library.</p>
          </div>
          <button type="button" className="sud-close-btn" onClick={attemptClose} disabled={isSubmitting}>
            <X size={17} weight="bold" />
          </button>
        </div>

        {/* Scrollable body */}
        <form id="sud-form" className="sud-body" onSubmit={handlePublish}>
          {errorMsg && <div className="sud-error-banner">{errorMsg}</div>}

          {/* Dropzone */}
          <div className="sud-section">
            <label className="sud-label">
              Screenshots <span className="sud-required">*</span>
            </label>
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
              <p className="sud-dropzone-main">Choose files or drag & drop here.</p>
              <p className="sud-dropzone-sub">PNG, JPG, WEBP • Max {MAX_SIZE_MB}MB each</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = null; }}
            />
          </div>

          {/* Upload queue */}
          {queue.length > 0 && (
            <div className="sud-section">
              <div className="sud-queue-header">
                <label className="sud-label">Uploads ({queue.length})</label>
                {queue.length > 1 && (
                  <button type="button" className="sud-add-more" onClick={() => fileInputRef.current?.click()}>
                    + Add more
                  </button>
                )}
              </div>
              <div className="sud-queue-list">
                {queue.map(item => (
                  <UploadQueueItem
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    onCategoryChange={updateCategory}
                  />
                ))}
              </div>
              {!allDone && queue.some(q => q.status === 'analyzing' || q.status === 'uploading') && (
                <p className="sud-ai-hint">
                  <Sparkle size={13} weight="fill" /> AI is classifying your sections…
                </p>
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
        </form>

        {/* Footer */}
        <div className="sud-footer">
          <button type="button" className="sud-cancel-btn" onClick={attemptClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="sud-form"
            className="sud-submit-btn"
            disabled={isSubmitting || !hasPublishable}
          >
            {isSubmitting
              ? <span>Publishing…</span>
              : <><Sparkle size={14} weight="fill" /> Publish Section{queue.filter(q => q.status === 'done').length > 1 ? 's' : ''}</>
            }
          </button>
        </div>
      </aside>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawer, document.body) : drawer;
}
