import React from 'react';
import { X, Plus } from 'lucide-react';
import FormField from './FormField';

export default function DynamicList({ title, items, onChange, onAdd, onRemove, addLabel }) {
  return (
    <div className="dynamic-list-container">
      <h3 className="dynamic-list-title">{title}</h3>
      
      <div className="dynamic-list-header">
        <div className="dl-col-label">Name</div>
        <div className="dl-col-label">Website</div>
        <div className="dl-col-action"></div>
      </div>

      <div className="dynamic-list-rows">
        {items.map((item, index) => (
          <div key={index} className="dynamic-list-row">
            <div className="dl-col-input">
              <input 
                type="text" 
                className="form-field-input"
                placeholder="e.g. John Doe"
                value={item.name}
                onChange={e => onChange(index, 'name', e.target.value)}
              />
            </div>
            <div className="dl-col-input">
              <input 
                type="text" 
                className="form-field-input"
                placeholder="e.g. johndoe.com"
                value={item.url}
                onChange={e => onChange(index, 'url', e.target.value)}
              />
            </div>
            <div className="dl-col-action">
              {items.length > 1 && (
                <button type="button" className="dl-remove-btn" onClick={() => onRemove(index)} aria-label="Remove">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="dl-add-btn" onClick={onAdd}>
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}
