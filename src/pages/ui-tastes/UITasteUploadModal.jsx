import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadSimple, 
  Check, 
  Sparkle, 
  LinkSimple, 
  TagSimple, 
  CaretDown,
  InstagramLogo,
  XLogo,
  PinterestLogo,
  BehanceLogo,
  DribbbleLogo,
  DotsThree
} from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import './UITasteUploadModal.css';

export const UI_TASTE_CATEGORIES = [
  'Landing Pages',
  'Hero',
  'Testimonials',
  'Pricing',
  'Features',
  'CTA',
  'Navigation',
  'Footer',
  'FAQ',
  'Cards',
  'Forms',
  'Dashboard',
  'Tables',
  'Charts',
  'Authentication',
  'Onboarding',
  'Mobile UI',
  'Animation',
  'Typography',
  'Components',
  'Design Systems',
  'E-commerce',
  'Fintech',
  'SaaS',
  'Portfolio',
  'Other'
];

export const UI_TASTE_PLATFORMS = [
  { id: 'Instagram', name: 'Instagram', icon: InstagramLogo },
  { id: 'X', name: 'X / Twitter', icon: XLogo },
  { id: 'Pinterest', name: 'Pinterest', icon: PinterestLogo },
  { id: 'Behance', name: 'Behance', icon: BehanceLogo },
  { id: 'Dribbble', name: 'Dribbble', icon: DribbbleLogo },
  { id: 'Other', name: 'Other', icon: DotsThree }
];

export default function UITasteUploadModal({
  isOpen,
  onClose,
  initialFile = null,
  initialCategory = 'Landing Pages',
  onUploadSuccess
}) {
  const { user } = useAuth ? useAuth() : { user: null };
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [platform, setPlatform] = useState('Instagram');
  const [sourceUrl, setSourceUrl] = useState('');
  const [username, setUsername] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Check if any form fields have been modified
  const isDirty = Boolean(file || sourceUrl.trim() || username.trim() || tags.trim() || notes.trim());

  useEffect(() => {
    if (initialFile) {
      handleFileSelected(initialFile);
    }
  }, [initialFile]);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key with unsaved changes confirmation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        attemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, isDirty]);

  if (!isOpen) return null;

  const resetForm = () => {
    setFile(null);
    setPreviewUrl('');
    setSourceUrl('');
    setUsername('');
    setTags('');
    setNotes('');
    setErrorMsg('');
  };

  const forceClose = () => {
    resetForm();
    onClose();
  };

  const attemptClose = () => {
    if (isSubmitting) return;
    if (isDirty) {
      const confirmDismiss = window.confirm('You have unsaved changes. Discard and close the upload drawer?');
      if (confirmDismiss) {
        forceClose();
      }
    } else {
      forceClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      attemptClose();
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // Limit to 25MB max
    if (selectedFile.size > 25 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 25MB');
      return;
    }

    setErrorMsg('');
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  // Auto-detect platform from source URL if user enters one
  const handleSourceUrlChange = (e) => {
    const val = e.target.value;
    setSourceUrl(val);

    const lower = val.toLowerCase();
    if (lower.includes('instagram.com')) setPlatform('Instagram');
    else if (lower.includes('twitter.com') || lower.includes('x.com')) setPlatform('X');
    else if (lower.includes('pinterest.com')) setPlatform('Pinterest');
    else if (lower.includes('behance.net')) setPlatform('Behance');
    else if (lower.includes('dribbble.com')) setPlatform('Dribbble');
  };

  // Downscale image if larger than max dimension to optimize load time & bandwidth
  const optimizeImage = (imageFile) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = imageFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < imageFile.size) {
              resolve(new File([blob], imageFile.name, { type: mimeType }));
            } else {
              resolve(imageFile);
            }
          },
          mimeType,
          0.88
        );
      };
      img.onerror = () => resolve(imageFile);
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const convertToBase64 = (fileOrBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !previewUrl) {
      setErrorMsg('Please select or drop a screenshot image first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let finalMediaUrl = '';
      const optimizedFile = await optimizeImage(file);

      // Strategy 1: If user is authenticated, upload to Supabase Storage 'submissions' bucket
      if (user) {
        try {
          const fileExt = file.name.split('.').pop() || 'png';
          const storageFileName = `ui-tastes/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: storageError } = await supabase.storage
            .from('submissions')
            .upload(storageFileName, optimizedFile, { cacheControl: '3600', upsert: true });

          if (!storageError) {
            const { data: { publicUrl } } = supabase.storage
              .from('submissions')
              .getPublicUrl(storageFileName);
            finalMediaUrl = publicUrl;
          }
        } catch (uploadErr) {
          console.warn('[upload] Storage upload failed, falling back to optimized inline data URL:', uploadErr);
        }
      }

      // Strategy 2: If not stored or unauthenticated, convert to high-efficiency data URL
      if (!finalMediaUrl) {
        finalMediaUrl = await convertToBase64(optimizedFile);
      }

      // Format tags and description
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const formattedTags = tagList.length > 0 ? `[Tags: ${tagList.join(', ')}]` : '';
      const finalDescription = [formattedTags, notes.trim()].filter(Boolean).join(' ') ||
        `Manually added ${category} inspiration.`;

      // Unique reference URL if no source URL was provided
      const platformSlug = platform ? platform.toLowerCase().replace(/[^a-z0-9]/g, '') : 'upload';
      const cleanSourceUrl = sourceUrl.trim() || `https://${platformSlug}.com/manual-upload/${Date.now()}`;
      const cleanUsername = username.trim() || (platform ? `${platform.toLowerCase()}_user` : 'inspiration');

      // Save into ui_tastes table via telegram-bot Edge Function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('telegram-bot', {
        body: {
          url: cleanSourceUrl,
          insert: true,
          category,
          metadata: {
            mediaUrl: finalMediaUrl,
            title: cleanUsername,
            description: finalDescription,
            isVideo: false,
            platform: platform
          }
        }
      });

      if (edgeError) {
        throw new Error(edgeError.message || 'Failed to save inspiration.');
      } else if (edgeData?.status === 'error') {
        throw new Error(edgeData.message || 'Failed to save inspiration.');
      }

      if (onUploadSuccess) {
        onUploadSuccess({
          category,
          platform,
          url: cleanSourceUrl
        });
      }

      forceClose();
    } catch (err) {
      console.error('[UITasteUploadDrawer] Error:', err);
      setErrorMsg(err.message || 'Failed to save screenshot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ui-drawer-backdrop" onClick={handleBackdropClick}>
      <aside
        className="ui-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-drawer-title"
      >
        {/* Fixed Top Header — Left Aligned */}
        <div className="ui-drawer-header">
          <div className="ui-drawer-title-group">
            <h2 id="upload-drawer-title" className="ui-drawer-title">
              Upload UI/UX Inspiration
            </h2>
            <p className="ui-drawer-subtitle">
              Save screenshots, section patterns, or mobile UI directly into your Tastes feed.
            </p>
          </div>
          <button
            type="button"
            className="ui-drawer-close-btn"
            onClick={attemptClose}
            aria-label="Close drawer"
            disabled={isSubmitting}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="ui-taste-drawer-form" className="ui-drawer-body">
          {errorMsg && (
            <div className="ui-drawer-error-banner">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Screenshot Dropzone matching Create New Website Submission style */}
          <div className="ui-drawer-section">
            <label className="ui-drawer-label">
              Screenshot / Image <span className="ui-drawer-required">*</span>
            </label>

            {previewUrl ? (
              <div className="ui-drawer-preview-card">
                <div className="ui-drawer-preview-media">
                  <img src={previewUrl} alt="Inspiration preview" className="ui-drawer-preview-img" />
                </div>
                <div className="ui-drawer-preview-footer">
                  <span className="ui-drawer-filename">
                    {file ? file.name : 'Screenshot image'}
                  </span>
                  <button
                    type="button"
                    className="ui-drawer-replace-btn"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`ui-drawer-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <div className="pmu-icon-circle-wrapper">
                  <UploadSimple size={18} weight="bold" />
                </div>
                <p className="pmu-main-text">
                  Click to browse or drag and drop
                </p>
                <p className="pmu-sub-text">
                  PNG, JPG, JPEG, WEBP up to 25MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.value && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Category Dropdown with Phosphor CaretDown and Balanced Spacing */}
          <div className="ui-drawer-section">
            <label className="ui-drawer-label">
              Category <span className="ui-drawer-required">*</span>
            </label>
            <div className="ui-drawer-select-wrapper">
              <select
                className="ui-drawer-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {UI_TASTE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="ui-drawer-select-caret">
                <CaretDown size={14} weight="bold" />
              </div>
            </div>
          </div>

          {/* Source Platform Chips with Phosphor Platform Logos */}
          <div className="ui-drawer-section">
            <label className="ui-drawer-label">
              Source Platform <span className="ui-drawer-optional">(Optional)</span>
            </label>
            <div className="ui-drawer-chips-grid">
              {UI_TASTE_PLATFORMS.map((p) => {
                const isSelected = platform === p.id;
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`ui-drawer-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setPlatform(p.id)}
                  >
                    {isSelected ? (
                      <Check size={13} weight="bold" />
                    ) : (
                      <IconComponent size={14} weight="bold" />
                    )}
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source URL with Phosphor LinkSimple */}
          <div className="ui-drawer-section">
            <label className="ui-drawer-label">
              Source URL <span className="ui-drawer-optional">(Optional)</span>
            </label>
            <div className="ui-drawer-input-wrap">
              <LinkSimple size={15} weight="bold" color="#888888" className="ui-drawer-input-icon" />
              <input
                type="url"
                className="ui-drawer-input"
                placeholder="https://instagram.com/p/... or x.com/..."
                value={sourceUrl}
                onChange={handleSourceUrlChange}
              />
            </div>
          </div>

          {/* Designer / Username */}
          <div className="ui-drawer-section">
            <label className="ui-drawer-label">
              Designer / Username <span className="ui-drawer-optional">(Optional)</span>
            </label>
            <div className="ui-drawer-input-wrap plain">
              <input
                type="text"
                className="ui-drawer-input"
                placeholder="@username or studio name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Tags with Phosphor TagSimple */}
          <div className="ui-drawer-section">
            <label className="ui-drawer-label">
              Tags <span className="ui-drawer-optional">(Optional, comma-separated)</span>
            </label>
            <div className="ui-drawer-input-wrap">
              <TagSimple size={15} weight="bold" color="#888888" className="ui-drawer-input-icon" />
              <input
                type="text"
                className="ui-drawer-input"
                placeholder="testimonials, dark mode, social proof, bento"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Notes / Description */}
          <div className="ui-drawer-section">
            <label className="ui-drawer-label">
              Notes / Description <span className="ui-drawer-optional">(Optional)</span>
            </label>
            <textarea
              className="ui-drawer-textarea"
              placeholder="What makes this UI pattern or interaction notable?"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </form>

        {/* Sticky Fixed Bottom Footer */}
        <div className="ui-drawer-footer">
          <button
            type="button"
            className="ui-drawer-cancel-btn"
            onClick={attemptClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ui-taste-drawer-form"
            className="ui-drawer-submit-btn"
            disabled={isSubmitting || (!file && !previewUrl)}
          >
            {isSubmitting ? (
              <span className="ui-drawer-spinner-text">Saving...</span>
            ) : (
              <>
                <Sparkle size={15} weight="fill" />
                <span>Save to Tastes</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
