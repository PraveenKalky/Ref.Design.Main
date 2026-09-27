export const normaliseUrl = (urlStr) => {
  if (!urlStr) return '';
  try {
    const u = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    let hostname = u.hostname.replace(/^www\./, '');
    let pathname = u.pathname.replace(/\/$/, '');
    return `${hostname}${pathname}`;
  } catch (e) {
    return urlStr;
  }
};

export const isValidUrl = (urlStr) => {
  if (!urlStr) return false;
  try {
    new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateSubmitForm = (formData) => {
  const errors = {};
  
  if (!formData.url) {
    errors.url = 'Website URL is required';
  } else if (!isValidUrl(formData.url)) {
    errors.url = 'Please enter a valid URL';
  }

  if (!formData.title) {
    errors.title = 'Website title is required';
  }

  if (!formData.description) {
    errors.description = 'Description is required';
  }

  if (formData.tags.length === 0) {
    errors.tags = 'Please select at least one tag';
  }

  return errors;
};
