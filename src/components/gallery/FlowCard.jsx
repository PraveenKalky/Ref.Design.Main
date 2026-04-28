import React from 'react';
import { Bookmark, Eye, Layers } from 'lucide-react';

const FlowCard = ({ flow }) => {
  return (
    <div className="flow-card">
      <div className="flow-card-preview">
        <img src={flow.image} alt={flow.title} />
        <div className="flow-card-badge">
          {flow.category}
        </div>
      </div>
      <div className="flow-card-content">
        <h3 className="flow-card-title">{flow.title}</h3>
        <div className="flow-card-info">
          <div className="flow-card-author">
            <div className="flow-card-avatar" />
            <span>{flow.author}</span>
          </div>
          <div className="flow-card-stats">
            <div className="flow-card-stat">
              <Layers size={14} />
              <span>{flow.screenCount}</span>
            </div>
            <div className="flow-card-stat">
              <Eye size={14} />
              <span>{flow.views}</span>
            </div>
            <Bookmark size={14} className="flow-card-bookmark" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowCard;
