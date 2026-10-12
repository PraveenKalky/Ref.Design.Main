/**
 * Universal media utilities for Ref.Design
 * Accurately detects videos, animated images (GIF, AVIF), and static assets.
 */

export const isVideoMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:video/')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mkv') ||
    clean.includes('/video/')
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
