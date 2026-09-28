import { supabase } from '../lib/supabase';

export const uploadWithProgress = async (file, bucket, path, onProgress) => {
  // Get active session token to allow RLS protected uploads
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ data: JSON.parse(xhr.responseText), error: null });
      } else {
        let errStr = xhr.responseText;
        try { errStr = JSON.parse(xhr.responseText).message || errStr; } catch(e){}
        resolve({ data: null, error: new Error(errStr) });
      }
    };

    xhr.onerror = () => resolve({ data: null, error: new Error('Network error during upload') });

    xhr.open('POST', url, true);
    // Use the user's JWT token for authentication
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    
    xhr.send(file);
  });
};
