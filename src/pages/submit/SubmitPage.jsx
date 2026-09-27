import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Check, Loader2 } from 'lucide-react';
import FormField from './components/FormField';
import DynamicList from './components/DynamicList';
import TagsDropdown from './components/TagsDropdown';
import MockCaptcha from './components/MockCaptcha';
import { normaliseUrl, validateSubmitForm } from './utils/validation';
import './SubmitPage.css';

export default function SubmitPage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    tags: [],
    creators: [{ name: '', url: '' }]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainError, setMainError] = useState('');
  const [success, setSuccess] = useState(false);

  const checkDuplicate = async (normUrl) => {
    // We only check if Supabase is connected. If not, we skip.
    if (!supabase) return null;
    try {
      const { data } = await supabase
        .from('submissions')
        .select('id, status')
        .eq('normalised_url', normUrl)
        .limit(1);
      return data && data.length > 0 ? data[0] : null;
    } catch {
      return null; // Ignore errors if table doesn't exist yet as requested
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleListChange = (listName, index, field, value) => {
    const newList = [...formData[listName]];
    newList[index][field] = value;
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };

  const handleListAdd = (listName) => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...prev[listName], { name: '', url: '' }]
    }));
  };

  const handleListRemove = (listName, index) => {
    const newList = formData[listName].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMainError('');
    
    // 1. Validate required fields
    const validationErrors = validateSubmitForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to the first error roughly
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    // 2. Auth check
    if (!user) {
      // If not authenticated, we open the modal and halt submission
      // Data is preserved in state
      window.dispatchEvent(new CustomEvent('open-login'));
      return;
    }

    setIsSubmitting(true);

    try {
      const normUrl = normaliseUrl(formData.url);
      
      // 3. Duplicate Check
      const duplicate = await checkDuplicate(normUrl);
      if (duplicate) {
        throw new Error(`This website has already been submitted and is currently ${duplicate.status.toLowerCase()}.`);
      }

      // 4. Save to Database (if it exists)
      if (supabase) {
        const { error: dbError } = await supabase
          .from('submissions')
          .insert([{
            url: formData.url,
            normalised_url: normUrl,
            title: formData.title,
            description: formData.description,
            categories: formData.tags, // Storing all tags in one array for now based on UI
            creator: formData.creators, // Updated to array JSONB
            status: 'Pending',
            submitted_by: user.id
          }]);

        if (dbError) throw dbError;
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setMainError(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="submit-page">
        <div className="success-state">
          <div className="success-icon"><Check size={40} strokeWidth={3} /></div>
          <h1 className="success-title">Submission received!</h1>
          <p className="success-desc">
            Your website has been successfully submitted and is now pending review. We will notify you once it's approved and live.
          </p>
          <button 
            className="submit-btn-accent" 
            style={{ marginTop: 32, alignSelf: 'center' }}
            onClick={() => {
              setSuccess(false);
              setFormData({ url: '', title: '', description: '', tags: [], creators: [{ name: '', url: '' }] });
            }}
          >
            Submit another website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-page font-polysans">
      <div className="submit-header">
        <h1 className="submit-title">Submit your favorite website</h1>
        <p className="submit-subtitle">
          We appreciate every submission - while not all entries make it into the gallery, each one is carefully reviewed and considered for inclusion.
        </p>
      </div>

      {mainError && <div className="form-main-error" style={{ marginBottom: 24 }}>{mainError}</div>}

      <form className="submit-form" onSubmit={handleSubmit} noValidate>
        
        {/* Section 1: Website details */}
        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Website details</h2>
            <p className="form-section-subtitle">Please provide information about the website you'd like to submit.</p>
          </div>
          
          <div className="form-row">
            <FormField 
              id="url"
              label="Website URL"
              placeholder="e.g. example.com"
              value={formData.url}
              onChange={val => handleChange('url', val)}
              error={errors.url}
              required
            />
            <FormField 
              id="title"
              label="Website title"
              placeholder="e.g. Amazing Website"
              value={formData.title}
              onChange={val => handleChange('title', val)}
              error={errors.title}
              required
            />
          </div>

          <FormField 
            id="description"
            label="Description"
            placeholder="Brief description of what makes this website special..."
            value={formData.description}
            onChange={val => handleChange('description', val)}
            error={errors.description}
            as="textarea"
            required
          />

          <TagsDropdown 
            selectedTags={formData.tags}
            onChange={val => { handleChange('tags', val); }}
            maxTags={5}
          />
          {errors.tags && <span className="form-field-error-text">{errors.tags}</span>}
        </div>

        {/* Section 2: Maker/Creator */}
        <div className="form-section">
          <DynamicList 
            title="Maker/Creator"
            items={formData.creators}
            onChange={(idx, field, val) => handleListChange('creators', idx, field, val)}
            onAdd={() => handleListAdd('creators')}
            onRemove={(idx) => handleListRemove('creators', idx)}
            addLabel="Add another developer"
          />
        </div>

        {/* Footer actions */}
        <div className="form-section" style={{ gap: 32 }}>
          <button type="submit" className="submit-btn-accent" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              'Confirm submission'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
