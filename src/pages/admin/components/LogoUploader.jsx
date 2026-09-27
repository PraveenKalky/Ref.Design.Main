import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader, X } from 'lucide-react';
import './LogoUploader.css';

const MAX_SIZE_MB = 5;

const LogoUploader = ({ value, onChange, folder = 'logos' }) => {
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

    // Validate type (PNG, JPG, JPEG, WEBP, SVG)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported file type. Please upload PNG, JPG, WEBP, or SVG.');
      return;
    }

    // Validate size
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
      console.error('Error uploading logo:', err);
      setErrorMsg('Failed to upload logo.');
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

  return (
    <div className="logo-uploader-wrapper">
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      
      <div className="lu-layout">
        <div className="lu-left">
          {value ? (
            <div className="lu-preview-box">
              <img src={value} alt="Logo" className="lu-preview-image" />
              <button className="lu-remove-btn" onClick={handleRemove} title="Remove logo">
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <div className="lu-preview-box empty">
              <span className="lu-placeholder-text">LOGO<br/>PREVIEW</span>
            </div>
          )}
        </div>

        <div className="lu-right">
          <div 
            className={`lu-dropzone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            {uploading ? (
              <div className="lu-uploading">
                <Loader className="lu-spin" size={18} />
                <span>Uploading...</span>
              </div>
            ) : (
              <span className="lu-btn-text">
                {value ? 'Replace logo' : 'Select your website logo'}
              </span>
            )}
          </div>
          
          <div className="lu-help-text">
            Recommended 160×160px • 1:1 • Max {MAX_SIZE_MB}MB<br />
            PNG, JPG, WEBP, SVG
          </div>
        </div>
      </div>
      
      {errorMsg && <div className="lu-error-msg">{errorMsg}</div>}
    </div>
  );
};

export default LogoUploader;
