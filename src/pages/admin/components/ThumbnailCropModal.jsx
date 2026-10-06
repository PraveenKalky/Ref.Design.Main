import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Crop, Upload, RotateCcw, Loader } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { uploadWithProgress } from '../../../utils/uploadXHR';
import './ThumbnailCropModal.css';

const ASPECT_RATIO = 16 / 10;

const ThumbnailCropModal = ({ item, index, onClose, onSave }) => {
  const [yOffsetPercent, setYOffsetPercent] = useState(item?.cropData?.yPercent || 0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCustomUploading, setIsCustomUploading] = useState(false);
  
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const customFileInputRef = useRef(null);

  const fullImageUrl = item.url;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartOffset(yOffsetPercent);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current || !imgRef.current) return;
      const imgHeight = imgRef.current.clientHeight;
      const containerHeight = containerRef.current.clientHeight;
      
      const deltaY = e.clientY - startY;
      const maxScrollable = imgHeight - (imgRef.current.clientWidth / ASPECT_RATIO);
      
      if (maxScrollable <= 0) return;

      const deltaPercent = (deltaY / imgHeight) * 100;
      const newPercent = Math.max(0, Math.min(100 * (maxScrollable / imgHeight), startOffset + deltaPercent));
      
      setYOffsetPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startOffset]);

  const handleSaveCrop = async () => {
    if (!fullImageUrl) return;
    setIsSaving(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullImageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const naturalW = img.naturalWidth || 1280;
      const naturalH = img.naturalHeight || 800;

      const cropW = naturalW;
      const cropH = Math.min(naturalH, Math.round(naturalW / ASPECT_RATIO));
      const startPixelY = Math.round((yOffsetPercent / 100) * naturalH);
      const safePixelY = Math.min(naturalH - cropH, Math.max(0, startPixelY));

      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = Math.round(1280 / ASPECT_RATIO);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, safePixelY, cropW, cropH, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.88));
      if (!blob) throw new Error('Failed to generate thumbnail crop');

      const thumbFileName = `thumbnails/thumb-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const thumbFile = new File([blob], thumbFileName, { type: 'image/jpeg' });

      const uploadResult = await uploadWithProgress(thumbFile, 'submissions', thumbFileName, () => {});
      if (uploadResult.error) throw uploadResult.error;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(thumbFileName);

      onSave(index, {
        ...item,
        thumbnailUrl: publicUrl,
        thumbnailSource: 'auto_crop',
        cropData: { yPercent: yOffsetPercent, heightPercent: (cropH / naturalH) * 100 }
      });
      onClose();
    } catch (err) {
      console.error('Error saving thumbnail crop:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCustomUploading(true);
    try {
      const thumbFileName = `thumbnails/custom-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      const uploadResult = await uploadWithProgress(file, 'submissions', thumbFileName, () => {});
      if (uploadResult.error) throw uploadResult.error;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(thumbFileName);

      onSave(index, {
        ...item,
        thumbnailUrl: publicUrl,
        thumbnailSource: 'custom_upload',
        cropData: null
      });
      onClose();
    } catch (err) {
      console.error('Error uploading custom thumbnail:', err);
    } finally {
      setIsCustomUploading(false);
    }
  };

  return (
    <div className="tc-modal-overlay" onClick={onClose}>
      <div className="tc-modal-content" onClick={e => e.stopPropagation()}>
        <div className="tc-modal-header">
          <div>
            <h3>Adjust Card Thumbnail Crop</h3>
            <p className="tc-modal-subtitle">
              Drag the 16:10 viewport box vertically over the full screenshot to select the card preview.
            </p>
          </div>
          <button className="tc-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="tc-modal-body">
          {/* Left Column: Interactive Viewport Selector */}
          <div className="tc-crop-column">
            <span className="tc-section-label">Full Page Screenshot</span>
            <div className="tc-fullpage-viewport-container" ref={containerRef}>
              <div className="tc-fullpage-scroll-wrapper">
                <img 
                  ref={imgRef}
                  src={fullImageUrl} 
                  alt={item.title} 
                  className="tc-fullpage-image" 
                />
                <div 
                  className={`tc-crop-box ${isDragging ? 'dragging' : ''}`}
                  style={{ top: `${yOffsetPercent}%` }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="tc-crop-box-header">
                    <Crop size={14} /> <span>16:10 Card Viewport</span>
                  </div>
                  <div className="tc-crop-handle handle-top" />
                  <div className="tc-crop-handle handle-bottom" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-time Card Preview */}
          <div className="tc-preview-column">
            <span className="tc-section-label">Live Card Preview</span>
            <div className="tc-card-preview-wrapper">
              <div className="tc-card-preview">
                <div 
                  className="tc-card-preview-image-inner"
                  style={{
                    backgroundImage: `url(${fullImageUrl})`,
                    backgroundPosition: `center ${yOffsetPercent}%`,
                    backgroundSize: '100% auto'
                  }}
                />
              </div>
              <span className="tc-card-title">{item.title || 'Website Title'}</span>
              <span className="tc-card-sub">16:10 Card Aspect Ratio</span>
            </div>

            <div className="tc-options-box">
              <span className="tc-options-title">Custom Graphic?</span>
              <p className="tc-options-desc">
                Prefer to upload a dedicated preview image instead of cropping the screenshot?
              </p>
              <input 
                type="file" 
                ref={customFileInputRef}
                accept="image/png, image/jpeg, image/webp"
                onChange={handleCustomThumbnailUpload}
                style={{ display: 'none' }}
              />
              <button 
                type="button"
                className="tc-custom-upload-btn"
                onClick={() => customFileInputRef.current?.click()}
                disabled={isCustomUploading}
              >
                {isCustomUploading ? <Loader size={14} className="tc-spin" /> : <Upload size={14} />}
                <span>Upload Custom Thumbnail</span>
              </button>
            </div>
          </div>
        </div>

        <div className="tc-modal-footer">
          <button className="tc-btn tc-btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button className="tc-btn tc-btn-primary" onClick={handleSaveCrop} disabled={isSaving}>
            {isSaving ? <Loader size={14} className="tc-spin" /> : <Check size={14} />}
            <span>Save Thumbnail Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailCropModal;
