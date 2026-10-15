import React from 'react';
import { 
  InstagramLogo, 
  XLogo, 
  DribbbleLogo, 
  LinkedinLogo, 
  PinterestLogo, 
  BehanceLogo, 
  Globe 
} from '@phosphor-icons/react';

/**
 * Centrally and reliably identifies the platform from post URL and/or existing metadata.
 * Prioritizes actual source URL domain patterns to eliminate incorrect classifications.
 */
export function detectPlatform(url = '', currentPlatform = '') {
  const u = (url || '').toLowerCase();
  
  // 1. Direct domain identification from verified URL
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('dribbble.com')) return 'Dribbble';
  if (u.includes('linkedin.com') || u.includes('lnkd.in')) return 'LinkedIn';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'X';
  if (u.includes('behance.net')) return 'Behance';
  if (u.includes('pinterest.com') || u.includes('pin.it')) return 'Pinterest';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';

  // 2. Fallback to existing platform field if URL is manual/local or non-domain
  if (currentPlatform) {
    const p = currentPlatform.trim().toLowerCase();
    if (p === 'instagram') return 'Instagram';
    if (p === 'dribbble') return 'Dribbble';
    if (p === 'linkedin') return 'LinkedIn';
    if (p === 'x' || p === 'twitter') return 'X';
    if (p === 'behance') return 'Behance';
    if (p === 'pinterest') return 'Pinterest';
    if (p === 'youtube') return 'YouTube';
    if (p === 'web' || p === 'website') return 'Web';
    return currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1);
  }

  return 'Web';
}

/**
 * Centralized platform icon mapping component.
 * Guarantees correct official brand icons for Dribbble, LinkedIn, Instagram, X, Behance, and Pinterest.
 * Generic Globe is strictly restricted to genuinely unclassified web sources.
 */
export function PlatformIcon({ platform, url = '', size = 13, className = '', weight = 'bold' }) {
  const norm = detectPlatform(url, platform);

  switch (norm) {
    case 'Instagram':
      return <InstagramLogo size={size} weight={weight} className={className} aria-label="Instagram" />;
    case 'X':
      return <XLogo size={size} weight={weight} className={className} aria-label="X (Twitter)" />;
    case 'Dribbble':
      return <DribbbleLogo size={size} weight={weight} className={className} aria-label="Dribbble" />;
    case 'LinkedIn':
      return <LinkedinLogo size={size} weight={weight} className={className} aria-label="LinkedIn" />;
    case 'Behance':
      return <BehanceLogo size={size} weight={weight} className={className} aria-label="Behance" />;
    case 'Pinterest':
      return <PinterestLogo size={size} weight={weight} className={className} aria-label="Pinterest" />;
    case 'Web':
    default:
      return <Globe size={size} weight={weight} className={className} aria-label="Web" />;
  }
}

/**
 * Backward-compatible helper returning the icon JSX element.
 */
export function renderPlatformIcon(platform, size = 13, url = '') {
  return <PlatformIcon platform={platform} url={url} size={size} weight="bold" />;
}
