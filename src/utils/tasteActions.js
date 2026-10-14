import { supabase } from '../lib/supabase';

/**
 * Decodes HTML entities like &#x1f62e;, &quot;, &#039;, etc.
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => {
      try { return String.fromCharCode(dec); } catch (e) { return ''; }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try { return String.fromCharCode(parseInt(hex, 16)); } catch (e) { return ''; }
    })
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Extracts a clean, short, single-line title for UI/UX Tastes gallery display.
 * Eliminates platform suffixes, likes/comments counters, and nested quotes.
 */
export function getCleanTasteTitle(post) {
  if (!post) return 'Design Inspiration';

  let raw = post.title || post.username || '';
  raw = decodeHtmlEntities(raw).trim();

  // Strip leading @
  raw = raw.replace(/^@/, '');

  // Pattern 1: Dribbble author pattern: "Crypto Wallet by Hesam Sanei ✦ on Dribbble" -> "Crypto Wallet"
  if (/\s+by\s+/i.test(raw)) {
    const parts = raw.split(/\s+by\s+/i);
    if (parts[0] && parts[0].trim().length > 2) {
      raw = parts[0].trim();
    }
  }

  // Pattern 2: Instagram quoted title: Author on Instagram: "Real Title"
  if (/on Instagram:/i.test(raw)) {
    const instaQuoteMatch = raw.match(/on Instagram:\s*["“]?([^"”\n]+)/i);
    if (instaQuoteMatch && instaQuoteMatch[1] && instaQuoteMatch[1].trim().length > 3) {
      raw = instaQuoteMatch[1].trim();
    } else {
      raw = raw.split(/on Instagram/i)[0].trim();
    }
  }

  // Pattern 3: Author on Platform / (@handle) on X
  raw = raw.replace(/\s*\(@[a-zA-Z0-9_]+\)\s*on\s+(X|Twitter|Instagram|Dribbble|Behance)/gi, '');
  raw = raw.replace(/\s+on\s+(Instagram|Dribbble|Behance|X|Twitter|Pinterest|LinkedIn)(\s*:.*)?$/i, '');
  raw = raw.replace(/\s*\|\s*(Mohammad Ali|Dribbble|Behance|Instagram|LinkedIn|X|Twitter|Pinterest|AI Tool.*)$/gi, '');

  // Pattern 4: File names: "Screenrecorder-2026-04-22...mp4"
  if (/\.(mp4|webm|mov|png|jpe?g|webp)$/i.test(raw)) {
    raw = raw.replace(/\.(mp4|webm|mov|png|jpe?g|webp)$/i, '');
    if (/screenrecorder|screenshot/i.test(raw)) {
      raw = 'Screen Recording';
    }
  }

  // Pattern 5: If it's hashtag spam, generic fallback, or login prompt
  const isJunk = 
    !raw || 
    raw.startsWith('#') || 
    raw.toLowerCase() === 'instagram' || 
    raw.toLowerCase() === 'imported_post' || 
    raw.toLowerCase() === 'dribbble' ||
    raw.toLowerCase().includes('log in to instagram') ||
    raw.toLowerCase().includes('create an account');

  if (isJunk && post.description) {
    const cleanDesc = decodeHtmlEntities(post.description).trim()
      .replace(/^[\d,]+\s*likes[,\s\d]*comments\s*-\s*[^:]+:\s*["“]?/i, '')
      .replace(/^Auto-saved via Telegram\.?/i, '')
      .replace(/^\[Tags:[^\]]+\]\s*/i, '');

    const firstLine = cleanDesc.split(/[.\n]/)[0].replace(/^["“]|["”]$/g, '').trim();
    if (firstLine && firstLine.length > 2 && !firstLine.startsWith('#') && !firstLine.toLowerCase().includes('log in')) {
      raw = firstLine.substring(0, 70);
    }
  }

  // Strip leading/trailing quotes and extra punctuation
  raw = raw.replace(/^["“'\s]+|["”'\s]+$/g, '').trim();

  // If still generic or empty, provide a clean fall back
  if (!raw || raw.toLowerCase() === 'instagram' || raw.toLowerCase() === 'imported_post') {
    if (post.category && post.category !== 'Uncategorized') {
      return `${post.category} Inspiration`;
    }
    return 'Design Inspiration';
  }

  return raw;
}

/**
 * Normalizes platform name for consistent display:
 * Instagram, Dribbble, Behance, X, Pinterest, or Web.
 */
export function getDisplayPlatform(platform, url) {
  if (platform) {
    const p = platform.trim();
    const lower = p.toLowerCase();
    if (lower === 'twitter' || lower === 'x') return 'X';
    if (lower === 'instagram') return 'Instagram';
    if (lower === 'dribbble') return 'Dribbble';
    if (lower === 'behance') return 'Behance';
    if (lower === 'pinterest') return 'Pinterest';
    if (lower === 'linkedin') return 'LinkedIn';
    if (lower === 'youtube') return 'YouTube';
    if (lower === 'web' || lower === 'website') return 'Web';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }

  if (url) {
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('dribbble.com')) return 'Dribbble';
    if (url.includes('behance.net')) return 'Behance';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'X';
    if (url.includes('pinterest.com')) return 'Pinterest';
    if (url.includes('linkedin.com')) return 'LinkedIn';
  }

  return 'Web';
}

/**
 * Formats a relative timestamp (e.g. "1w ago" or "Saved 1w ago").
 */
export function formatTimeAgo(dateString, isSaved = false) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return isSaved ? `Saved ${dateString}` : dateString;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return isSaved ? 'Saved just now' : 'Just now';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    let timeStr = '';
    if (diffDays < 1) {
      if (diffHours < 1) {
        timeStr = diffMins <= 1 ? 'just now' : `${diffMins}m ago`;
      } else {
        timeStr = `${diffHours}h ago`;
      }
    } else if (diffDays < 7) {
      timeStr = `${diffDays}d ago`;
    } else if (diffWeeks < 5) {
      timeStr = `${diffWeeks}w ago`;
    } else if (diffMonths < 12) {
      timeStr = `${diffMonths}mo ago`;
    } else {
      timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return isSaved ? `Saved ${timeStr}` : timeStr;
  } catch (e) {
    return null;
  }
}

/**
 * Parses rich social metadata from post records for Layout 1 display:
 * Avatar, Display Name, @handle, 2-line description, Likes, Comments, and Date.
 */
export function parseSocialPost(post) {
  if (!post) {
    return {
      avatarUrl: null,
      displayName: 'Creator',
      handle: '',
      shortDesc: '',
      likes: null,
      comments: null,
      formattedDate: null,
      displayPlatform: 'Web'
    };
  }

  const displayPlatform = getDisplayPlatform(post.platform, post.url);
  const avatarUrl = post.avatar_url || post.author_avatar || null;

  let displayName = '';
  let handle = '';
  let likes = typeof post.likes === 'number' ? post.likes : null;
  let comments = typeof post.comments === 'number' ? post.comments : null;
  let postDate = null;
  let cleanDesc = decodeHtmlEntities(post.description || '').trim();

  // 1. Instagram metadata extraction from description
  // e.g.: 59 likes, 34 comments - x9_creatives on October 9, 2026: "He said..."
  const instaMetaMatch = cleanDesc.match(/^([\d,]+)\s+likes,\s+([\d,]+)\s+comments\s+-\s+([^\s]+)\s+on\s+([^:]+):\s*["“]?([\s\S]*)$/i);
  if (instaMetaMatch) {
    if (likes === null) likes = parseInt(instaMetaMatch[1].replace(/,/g, ''), 10);
    if (comments === null) comments = parseInt(instaMetaMatch[2].replace(/,/g, ''), 10);
    handle = '@' + instaMetaMatch[3].replace(/^@/, '');
    postDate = instaMetaMatch[4].trim();
    cleanDesc = instaMetaMatch[5].replace(/["”]$/, '').trim();
  }

  // Check for likes-only: e.g. 59 likes - username: "..."
  const instaLikesOnly = cleanDesc.match(/^([\d,]+)\s+likes\s+-\s+([^\s]+):\s*["“]?([\s\S]*)$/i);
  if (instaLikesOnly) {
    if (likes === null) likes = parseInt(instaLikesOnly[1].replace(/,/g, ''), 10);
    if (!handle) handle = '@' + instaLikesOnly[2].replace(/^@/, '');
    cleanDesc = instaLikesOnly[3].replace(/["”]$/, '').trim();
  }

  // 2. Author and handle extraction from post.username
  let rawUsername = decodeHtmlEntities(post.username || '').trim();

  // Format: Name (@handle) on X
  const xMatch = rawUsername.match(/^(.+?)\s+\((@[^)]+)\)\s+on\s+X$/i);
  if (xMatch) {
    displayName = xMatch[1].trim();
    handle = xMatch[2].trim();
  } else {
    // Format: Name on Platform
    const onPlatformMatch = rawUsername.match(/^(.+?)\s+on\s+(Instagram|Dribbble|Behance|X|Twitter|Pinterest|LinkedIn)(\s*:.*)?$/i);
    if (onPlatformMatch) {
      displayName = onPlatformMatch[1].trim();
    } else if (rawUsername.startsWith('@')) {
      handle = rawUsername;
      displayName = rawUsername.substring(1);
    } else if (rawUsername && rawUsername.toLowerCase() !== 'instagram' && rawUsername.toLowerCase() !== 'imported_post') {
      displayName = rawUsername;
    }
  }

  // Dribbble by-line check: "Project Title by Creator Name"
  if (displayName.includes(' by ')) {
    const byParts = displayName.split(/\s+by\s+/i);
    if (byParts[1]) {
      displayName = byParts[1].trim();
    }
  }

  // If handle still empty, check URL
  if (!handle && post.url) {
    const urlX = post.url.match(/(?:x|twitter)\.com\/([^\/\?]+)/i);
    if (urlX && !['status', 'home', 'i', 'explore'].includes(urlX[1])) {
      handle = '@' + urlX[1];
    }
    const urlInsta = post.url.match(/instagram\.com\/([^\/\?]+)/i);
    if (urlInsta && !['p', 'reel', 'stories', 'tv', 'explore'].includes(urlInsta[1])) {
      handle = '@' + urlInsta[1];
    }
    const urlDribbble = post.url.match(/dribbble\.com\/([^\/\?]+)/i);
    if (urlDribbble && !['shots', 'designers', 'stories', 'tags', 'following'].includes(urlDribbble[1])) {
      handle = '@' + urlDribbble[1];
    }
  }

  // Prevent hashtag strings from appearing as display name
  if (displayName.startsWith('#') || displayName.toLowerCase() === 'instagram' || displayName.toLowerCase() === 'imported_post') {
    displayName = handle ? handle.replace(/^@/, '') : (displayPlatform || 'Creator');
  }

  if (!displayName) {
    displayName = handle ? handle.replace(/^@/, '') : 'Creator';
  }

  // 3. Clean Description (strip tags, auto-saved markers, repeated quotes)
  cleanDesc = cleanDesc
    .replace(/^Auto-saved via Telegram\.?/i, '')
    .replace(/^\[Tags:[^\]]+\]\s*/i, '')
    .replace(/^["“]|["”]$/g, '')
    .trim();

  // If description was just title or identical to username, clear it
  if (cleanDesc.toLowerCase() === displayName.toLowerCase() || cleanDesc.toLowerCase() === rawUsername.toLowerCase()) {
    cleanDesc = '';
  }

  // 4. Determine clearly distinguished date
  // If postDate is available -> post date e.g. "Oct 9" or "1w ago"
  // If created_at is available -> saved date e.g. "Saved 1w ago"
  let formattedDate = null;
  if (postDate) {
    formattedDate = formatTimeAgo(postDate, false);
  } else if (post.created_at) {
    formattedDate = formatTimeAgo(post.created_at, true);
  }

  return {
    avatarUrl,
    displayName,
    handle,
    shortDesc: cleanDesc,
    likes,
    comments,
    formattedDate,
    displayPlatform
  };
}

/**
 * Updates title, category, and metadata for a post in ui_tastes table.
 */
export async function updateTasteInDB(post, updates) {
  if (!post || !post.id) return { error: new Error('Missing post ID') };

  const payload = {};
  if (updates.title !== undefined) payload.username = updates.title.trim();
  if (updates.username !== undefined) payload.username = updates.username.trim();
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.description !== undefined) payload.description = updates.description.trim();

  try {
    const { data, error } = await supabase
      .from('ui_tastes')
      .update(payload)
      .eq('id', post.id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('[updateTasteInDB] Error updating post:', err);
    return { data: null, error: err };
  }
}

/**
 * Permanently deletes a post from ui_tastes and cleans associated media from storage
 * only when the media is not shared by other posts.
 */
export async function deleteTasteFromDB(post) {
  if (!post || !post.id) return { error: new Error('Missing post ID') };

  try {
    // 1. Check if media is stored in Supabase storage 'submissions' bucket
    const urlsToClean = [post.media_url, post.thumbnail_url].filter(Boolean);
    for (const url of urlsToClean) {
      if (typeof url === 'string' && url.includes('/submissions/')) {
        try {
          // Check if any other post shares this media_url
          const { data: sharedPosts } = await supabase
            .from('ui_tastes')
            .select('id')
            .eq('media_url', url)
            .neq('id', post.id)
            .limit(1);

          if (!sharedPosts || sharedPosts.length === 0) {
            // Check if any section uses this same URL
            const { data: sharedSections } = await supabase
              .from('website_sections')
              .select('id')
              .eq('image_url', url)
              .limit(1);

            if (!sharedSections || sharedSections.length === 0) {
              const parts = url.split('/submissions/');
              if (parts[1]) {
                const storagePath = decodeURIComponent(parts[1].split('?')[0]);
                await supabase.storage.from('submissions').remove([storagePath]);
              }
            }
          }
        } catch (storageErr) {
          console.warn('[deleteTasteFromDB] Storage cleanup warning:', storageErr);
        }
      }
    }

    // 2. Delete the record from ui_tastes
    const { error } = await supabase
      .from('ui_tastes')
      .delete()
      .eq('id', post.id);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('[deleteTasteFromDB] Error deleting post:', err);
    return { error: err };
  }
}
