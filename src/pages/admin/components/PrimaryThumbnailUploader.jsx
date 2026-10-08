import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { UploadCloud, Loader, RefreshCw, Trash2, Image as ImageIcon, Crop, Eye, Info, X } from 'lucide-react';
import ThumbnailCropModal from './ThumbnailCropModal';
import './PrimaryThumbnailUploader.css';
import './PageMediaUploader.css';

const MAX_SIZE_MB = 50;

// Modal for viewing full page screenshot in full height
const FullPagePreviewModal = ({ url, title, onClose }) => {
  return (
    <div className="tc-modal-overlay" onClick={onClose}>
      <div className="tc-modal-content ptu-fullpage-modal-content" onClick={e => e.stopPropagation()}>
        <div className="tc-modal-header">
          <div>
            <h3>Full Landing Page Screenshot</h3>
            <p className="tc-modal-subtitle">{title || 'Original Full Height View'}</p>
          </div>
          <button className="tc-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="ptu-fullpage-modal-body">
          <img src={url} alt="Full Screenshot" className="ptu-fullpage-modal-img" />
        </div>
        <div className="tc-modal-footer">
          <button className="tc-btn tc-btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

const PrimaryThumbnailUploader = ({
  value = '',
  fullpageValue = '',
  useSeparateMedia = false,
  onChange,
  onFullpageChange,
  onToggleChange,
  folder = 'thumbnails'
}) => {
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingFullpage, setUploadingFullpage] = useState(false);
  
  const [dragActiveThumb, setDragActiveThumb] = useState(false);
  const [dragActiveFullpage, setDragActiveFullpage] = useState(false);
  
  const [errorMsgThumb, setErrorMsgThumb] = useState('');
  const [errorMsgFullpage, setErrorMsgFullpage] = useState('');

  const [showCropModal, setShowCropModal] = useState(false);
  const [showFullpageModal, setShowFullpageModal] = useState(false);

  const thumbInputRef = useRef(null);
  const fullpageInputRef = useRef(null);

  // Upload validation & handler
  const handleUpload = async (file, targetType) => {
    const isThumb = targetType === 'thumb';
    const setUploading = isThumb ? setUploadingThumb : setUploadingFullpage;
    const setError = isThumb ? setErrorMsgThumb : setErrorMsgFullpage;
    const setDrag = isThumb ? setDragActiveThumb : setDragActiveFullpage;

    setError('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const prefix = isThumb ? 'thumb' : 'fullpage';
      const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const targetFolder = isThumb ? 'thumbnails' : 'pages';
      const filePath = `${targetFolder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('submissions')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      if (isThumb) {
        onChange(publicUrl);
        // If separate media toggle is OFF, sync to fullpage automatically
        if (!useSeparateMedia && onFullpageChange) {
          onFullpageChange(publicUrl);
        }
      } else {
        if (onFullpageChange) onFullpageChange(publicUrl);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setDrag(false);
    }
  };

  const handleDropThumb = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveThumb(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0], 'thumb');
    }
  };

  const handleDropFullpage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveFullpage(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0], 'fullpage');
    }
  };

  return (
    <div className="primary-thumbnail-uploader">
      {/* Hidden file inputs */}
      <input
        ref={thumbInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0], 'thumb');
          }
          e.target.value = null;
        }}
        style={{ display: "none" }}
      />
      <input
        ref={fullpageInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0], 'fullpage');
          }
          e.target.value = null;
        }}
        style={{ display: "none" }}
      />

      {/* Header Row: Title on Left, Toggle Group on Right */}
      <div className="ptu-header-row">
        <label className="admin-label ptu-header-title">
          Primary Thumbnail (Card Image)<span style={{ color: '#ef4444', fontSize: '1.2em' }}>*</span>
        </label>
        <div className="ptu-toggle-group">
          <span className="ptu-toggle-title">Use separate images for thumbnail & landing page</span>
          <button
            type="button"
            role="switch"
            aria-checked={useSeparateMedia}
            className={`ptu-switch ${useSeparateMedia ? 'active' : ''}`}
            onClick={() => {
              const nextVal = !useSeparateMedia;
              if (onToggleChange) onToggleChange(nextVal);
              if (!nextVal && value && onFullpageChange) {
                onFullpageChange(value);
              }
            }}
          >
            <span className="ptu-switch-thumb" />
          </button>
        </div>
      </div>

      {/* Single Upload Mode (Toggle OFF) */}
      {!useSeparateMedia && (
        <div className="ptu-single-mode">
          {!value ? (
            <div
              className={`pmu-dropzone ${dragActiveThumb ? 'drag-active' : ''}`}
              onDragEnter={(e) => { e.preventDefault(); setDragActiveThumb(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActiveThumb(false); }}
              onDragOver={(e) => { e.preventDefault(); setDragActiveThumb(true); }}
              onDrop={handleDropThumb}
              onClick={() => thumbInputRef.current?.click()}
            >
              {uploadingThumb ? (
                <div className="pmu-uploading-state">
                  <Loader className="pmu-spin" size={32} />
                  <p>Uploading image...</p>
                </div>
              ) : (
                <div className="pmu-empty-state">
                  <div className="pmu-icon-circle-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z"></path>
                    </svg>
                  </div>
                  <p className="pmu-main-text" style={{ fontWeight: '500' }}>
                    Choose an image or drag & drop it here.
                  </p>
                  <p className="pmu-sub-text">
                    PNG, JPG, JPEG, WEBP • Max {MAX_SIZE_MB}MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="ptu-preview-container">
              <div className="ptu-image-wrapper">
                <img src={value} alt="Preview" className="ptu-preview-image" />
              </div>
              <div className="ptu-actions">
                <button type="button" onClick={() => setShowCropModal(true)} className="ptu-action-btn">
                  <Crop size={16} /> Crop
                </button>
                <button type="button" onClick={() => thumbInputRef.current?.click()} className="ptu-action-btn" disabled={uploadingThumb}>
                  {uploadingThumb ? <Loader className="ptu-spin" size={16} /> : <RefreshCw size={16} />} Replace
                </button>
                <button type="button" onClick={() => { onChange(''); if (onFullpageChange) onFullpageChange(''); }} className="ptu-action-btn ptu-action-remove" disabled={uploadingThumb}>
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          )}
          {errorMsgThumb && <div className="ptu-error-msg">{errorMsgThumb}</div>}
          <div className="ptu-helper-note">
            <Info size={14} /> Used for both Card Thumbnail + Landing Page / Detail View
          </div>
        </div>
      )}

      {/* Dual Upload Mode (Toggle ON) */}
      {useSeparateMedia && (
        <div className="ptu-dual-mode">
          {/* 1. Thumbnail / Card Image */}
          <div className="ptu-dual-section">
            <label className="ptu-section-label">
              Thumbnail / Card Image<span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
            </label>
            {!value ? (
              <div
                className={`pmu-dropzone ${dragActiveThumb ? 'drag-active' : ''}`}
                onDragEnter={(e) => { e.preventDefault(); setDragActiveThumb(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActiveThumb(false); }}
                onDragOver={(e) => { e.preventDefault(); setDragActiveThumb(true); }}
                onDrop={handleDropThumb}
                onClick={() => thumbInputRef.current?.click()}
              >
                {uploadingThumb ? (
                  <div className="pmu-uploading-state">
                    <Loader className="pmu-spin" size={32} />
                    <p>Uploading card image...</p>
                  </div>
                ) : (
                  <div className="pmu-empty-state">
                    <div className="pmu-icon-circle-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z"></path>
                      </svg>
                    </div>
                    <p className="pmu-main-text" style={{ fontWeight: '500' }}>
                      Upload card preview image
                    </p>
                    <p className="pmu-sub-text">Recommended ratio: 16:10 / 4:3</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="ptu-preview-container">
                <div className="ptu-image-wrapper card-aspect">
                  <img src={value} alt="Card Preview" className="ptu-preview-image" />
                </div>
                <div className="ptu-actions">
                  <button type="button" onClick={() => setShowCropModal(true)} className="ptu-action-btn">
                    <Crop size={16} /> Crop
                  </button>
                  <button type="button" onClick={() => thumbInputRef.current?.click()} className="ptu-action-btn" disabled={uploadingThumb}>
                    {uploadingThumb ? <Loader className="ptu-spin" size={16} /> : <RefreshCw size={16} />} Replace
                  </button>
                  <button type="button" onClick={() => onChange('')} className="ptu-action-btn ptu-action-remove" disabled={uploadingThumb}>
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            )}
            {errorMsgThumb && <div className="ptu-error-msg">{errorMsgThumb}</div>}
          </div>

          {/* 2. Landing Page / Full Screenshot */}
          <div className="ptu-dual-section">
            <label className="ptu-section-label">Landing Page / Full Screenshot</label>
            {!fullpageValue ? (
              <div
                className={`pmu-dropzone ${dragActiveFullpage ? 'drag-active' : ''}`}
                onDragEnter={(e) => { e.preventDefault(); setDragActiveFullpage(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActiveFullpage(false); }}
                onDragOver={(e) => { e.preventDefault(); setDragActiveFullpage(true); }}
                onDrop={handleDropFullpage}
                onClick={() => fullpageInputRef.current?.click()}
              >
                {uploadingFullpage ? (
                  <div className="pmu-uploading-state">
                    <Loader className="pmu-spin" size={32} />
                    <p>Uploading full page screenshot...</p>
                  </div>
                ) : (
                  <div className="pmu-empty-state">
                    <div className="pmu-icon-circle-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z"></path>
                      </svg>
                    </div>
                    <p className="pmu-main-text" style={{ fontWeight: '500' }}>
                      Upload full landing-page screenshot
                    </p>
                    <p className="pmu-sub-text">
                      Full-height screenshots supported • Original image will NOT be cropped
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="ptu-preview-container">
                <div className="ptu-image-wrapper fullpage-aspect">
                  <img src={fullpageValue} alt="Full Screenshot Preview" className="ptu-preview-image fullpage-img" />
                  <div className="ptu-scroll-indicator">↓ Full Height</div>
                </div>
                <div className="ptu-actions">
                  <button type="button" onClick={() => setShowFullpageModal(true)} className="ptu-action-btn">
                    <Eye size={16} /> Preview Full
                  </button>
                  <button type="button" onClick={() => fullpageInputRef.current?.click()} className="ptu-action-btn" disabled={uploadingFullpage}>
                    {uploadingFullpage ? <Loader className="ptu-spin" size={16} /> : <RefreshCw size={16} />} Replace
                  </button>
                  <button type="button" onClick={() => onFullpageChange && onFullpageChange('')} className="ptu-action-btn ptu-action-remove" disabled={uploadingFullpage}>
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            )}
            {errorMsgFullpage && <div className="ptu-error-msg">{errorMsgFullpage}</div>}
          </div>
        </div>
      )}

      {/* Crop Modal for Thumbnail */}
      {showCropModal && value && (
        <ThumbnailCropModal
          item={{ url: value, title: 'Card Thumbnail' }}
          index={0}
          onClose={() => setShowCropModal(false)}
          onSave={(_, updated) => {
            if (updated && updated.thumbnailUrl) {
              onChange(updated.thumbnailUrl);
            }
          }}
        />
      )}

      {/* Full Page Preview Modal */}
      {showFullpageModal && fullpageValue && (
        <FullPagePreviewModal
          url={fullpageValue}
          onClose={() => setShowFullpageModal(false)}
        />
      )}
    </div>
  );
};

export default PrimaryThumbnailUploader;
