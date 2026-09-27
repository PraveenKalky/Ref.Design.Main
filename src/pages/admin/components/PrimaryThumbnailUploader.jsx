import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { UploadCloud, Loader, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';
import './PrimaryThumbnailUploader.css';
import './PageMediaUploader.css';

const MAX_SIZE_MB = 50;

const PrimaryThumbnailUploader = ({ value, onChange, folder = 'thumbnails' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUpload = async (file) => {
    setErrorMsg('');
    if (!file) return;

    // Validate type (PNG, JPG, JPEG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP.');
      return;
    }

    // Validate size (50MB)
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('submissions')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setErrorMsg('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const handleReplace = (e) => {
    e.stopPropagation();
    inputRef.current.click();
  };

  return (
    <div className="primary-thumbnail-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      
      {!value ? (
        <div 
          className={`pmu-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          {uploading ? (
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
              <button 
                type="button"
                className="pmu-browse-btn"
                onClick={(e) => { e.stopPropagation(); onButtonClick(); }}
              >
                Browse File
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="ptu-preview-container">
          <div className="ptu-image-wrapper">
            <img src={value} alt="Preview" className="ptu-preview-image" />
          </div>
          <div className="ptu-actions">
            <button type="button" onClick={handleReplace} className="ptu-action-btn" disabled={uploading}>
              {uploading ? <Loader className="ptu-spin" size={16} /> : <RefreshCw size={16} />}
              Replace
            </button>
            <button type="button" onClick={handleRemove} className="ptu-action-btn ptu-action-remove" disabled={uploading}>
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        </div>
      )}

      {errorMsg && <div className="ptu-error-msg">{errorMsg}</div>}
    </div>
  );
};

export default PrimaryThumbnailUploader;
