/**
 * Universal media utilities for Ref.Design
 * Accurately detects videos, animated images (GIF, AVIF), and static assets.
 */

export const isImageMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image/')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.png') ||
    clean.endsWith('.webp') ||
    clean.endsWith('.avif') ||
    clean.endsWith('.gif') ||
    clean.endsWith('.svg') ||
    clean.endsWith('.bmp') ||
    clean.endsWith('.ico')
  );
};

export const isVideoMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:video/')) return true;
  if (isImageMedia(url)) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mkv') ||
    (clean.includes('/video/') && !clean.endsWith('.jpg') && !clean.endsWith('.png') && !clean.endsWith('.webp'))
  );
};

export const isGifMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image/gif')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.gif');
};

export const isAvifMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image/avif')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.avif');
};

export const isAnimatedImage = (fileOrUrl) => {
  if (!fileOrUrl) return false;
  if (typeof fileOrUrl === 'string') {
    return isGifMedia(fileOrUrl) || isAvifMedia(fileOrUrl);
  }
  const type = fileOrUrl.type || '';
  const name = fileOrUrl.name || '';
  return (
    type === 'image/gif' ||
    type === 'image/avif' ||
    name.toLowerCase().endsWith('.gif') ||
    name.toLowerCase().endsWith('.avif')
  );
};

/**
 * Checks if a URL is hosted on Supabase Storage or local assets
 * which don't require external proxying and support CORS.
 */
export const isDirectCdnUrl = (url) => {
  if (!url || typeof url !== 'string') return true;
  if (url.startsWith('/') || url.startsWith('data:')) return true;
  if (url.includes('supabase.co/storage/v1/object/public') || url.includes('supabase.in/storage/v1/object/public')) {
    return true;
  }
  return false;
};

/**
 * Returns the proxied URL for external media that may be subject to CORS or hotlinking blocks.
 */
export const getProxiedUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (isDirectCdnUrl(url) || url.includes('?proxy=')) return url;
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://ciquazqdnbwsxuomdmci.supabase.co';
  return `${supabaseUrl}/functions/v1/telegram-bot?proxy=${encodeURIComponent(url)}`;
};

/**
 * Gets optimal display URL for an image: direct CDN when available, or proxied for external hosts.
 */
export const getDisplayImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (isDirectCdnUrl(url)) return url;
  return getProxiedUrl(url);
};

