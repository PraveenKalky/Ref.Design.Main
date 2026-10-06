import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Upload, X, Loader } from 'lucide-react';
import './MediaUploader.css';

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

const MediaUploader = ({ onUpload, multiple = false, folder = 'misc' }) => {
  const [uploading, setUploading] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');
  const [uploadedHashes, setUploadedHashes] = useState(new Set());

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploading(true);
    setDuplicateMessage('');
    const uploadedUrls = [];
    const newHashes = new Set(uploadedHashes);
    let duplicatesFound = 0;

    for (const file of files) {
      const hash = await computeFileHash(file);
      if (newHashes.has(hash)) {
        duplicatesFound++;
        continue;
      }
      newHashes.add(hash);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('submissions')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    setUploadedHashes(newHashes);
    setUploading(false);

    if (duplicatesFound > 0) {
      setDuplicateMessage(`Already uploaded. (${duplicatesFound} duplicate file${duplicatesFound > 1 ? 's' : ''} skipped)`);
    }

    if (uploadedUrls.length > 0) {
      onUpload(multiple ? uploadedUrls : uploadedUrls[0]);
    }
  };

  return (
    <div className="media-uploader-container">
      <label className="media-uploader-label">
        <input 
          type="file" 
          accept="image/*,video/*" 
          multiple={multiple} 
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <div className="media-uploader-btn">
          {uploading ? <Loader className="spin" size={18} /> : <Upload size={18} />}
          <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
        </div>
      </label>
      {duplicateMessage && (
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⚠️ {duplicateMessage}</span>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
