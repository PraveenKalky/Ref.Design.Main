import React from 'react';

export default function FormField({ label, id, required, type = 'text', value, onChange, placeholder, onBlur, error, as = 'input' }) {
  const Component = as;
  
  return (
    <div className="form-field-group">
      <label className="form-field-label" htmlFor={id}>
        {label}
        {required && <span className="form-field-required">*</span>}
      </label>
      
      <div className="form-field-input-wrapper">
        <Component
          id={id}
          type={type}
          className={`form-field-input ${error ? 'has-error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
        />
      </div>
      
      {error && <span className="form-field-error-text">{error}</span>}
    </div>
  );
}
