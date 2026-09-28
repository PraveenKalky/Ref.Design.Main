import React from 'react';
import { Play, X } from 'lucide-react';
import './ActiveUploadItem.css';

const ActiveUploadItem = ({ upload, onCancel }) => {
  const sizeMB = (upload.size / (1024 * 1024)).toFixed(1);
  return (
    <div className="pmu-active-upload-item">
      <div className="pmu-au-thumb">
        {upload.file.type.startsWith('video/') ? (
          <div className="pmu-au-vid-placeholder"><Play size={12} fill="white" /></div>
        ) : (
          <img src={upload.previewUrl} alt="preview" />
        )}
      </div>
      <div className="pmu-au-details">
        <div className="pmu-au-header">
          <span className="pmu-au-filename" title={upload.filename}>{upload.filename}</span>
          <button className="pmu-au-cancel" onClick={() => onCancel(upload.id)} title="Cancel upload"><X size={14}/></button>
        </div>
        <div className="pmu-au-status">
          <span className={`pmu-au-text ${upload.status}`}>
            {upload.status === 'uploading' ? `Uploading... ${upload.progress}%` : upload.progressText}
          </span>
          <span className="pmu-au-size">&nbsp;&bull;&nbsp; Total: {sizeMB} MB</span>
        </div>
      </div>
    </div>
  );
};

export default ActiveUploadItem;
