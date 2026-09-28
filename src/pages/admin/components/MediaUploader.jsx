import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Upload, X, Loader } from 'lucide-react';
import './MediaUploader.css';

const MediaUploader = ({ onUpload, multiple = false, folder = 'misc' }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
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

    setUploading(false);
    onUpload(multiple ? uploadedUrls : uploadedUrls[0]);
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
    </div>
  );
};

export default MediaUploader;
