import { supabase } from '../lib/supabase.js';
import { detectPlatform } from './platformIcons.jsx';

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
 * Instagram, Dribbble, LinkedIn, Behance, X, Pinterest, or Web.
 */
export function getDisplayPlatform(platform, url) {
  return detectPlatform(url, platform);
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
 * Cleans the raw username string to display ONLY the creator's actual name.
 * Strips captions, quotes, "on Instagram", taglines after "|" or "•", bylines, etc.
 */
export function cleanCreatorName(raw, platform, handle) {
  if (!raw) return handle ? handle.replace(/^@/, '') : (platform || 'Creator');
  let str = decodeHtmlEntities(raw).trim();

  // 1. Remove "(@handle) on X" or "... on Platform: ..."
  // Note: [\s\S]* ensures matching across newlines in Instagram captions
  str = str.replace(/\s*\(@[a-zA-Z0-9_.]+\)\s*on\s+(?:X|Twitter|Instagram|Dribbble|Behance|LinkedIn)[\s\S]*$/i, '');
  str = str.replace(/\s+on\s+(?:Instagram|Dribbble|Behance|X|Twitter|Pinterest|LinkedIn)[\s\S]*$/i, '');

  // 2. Dribbble "Title by Author"
  if (/\s+by\s+/i.test(str)) {
    const byParts = str.split(/\s+by\s+/i);
    if (byParts[1]) str = byParts[1];
  }

  // 3. Remove professional titles, subtitles, and taglines after separators (| , • , · , — , –)
  // Pipe separator check: e.g. "Ikram Rana | AI Tool & Automation" or "Daily Productivity ... | Mohammad Ali"
  if (str.includes('|')) {
    const parts = str.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const left = parts[0];
      const right = parts[1];
      if (left.split(/\s+/).length <= 4 && !/ui|ux|design|dashboard|website|app|tool|expert|automation/i.test(left)) {
        str = left;
      } else if (right.split(/\s+/).length <= 4 && !/ui|ux|design|dashboard|website|app|tool|expert|automation/i.test(right)) {
        str = right;
      } else {
        str = left;
      }
    }
  }

  // Bullet or middle dot separator: e.g. "Marina Budarina • Design & Art"
  if (/[•·]/.test(str)) {
    str = str.split(/[•·]/)[0].trim();
  }

  // Dash separator with spaces: "Author Name - UX Designer"
  if (/\s+[-–—]\s+/.test(str)) {
    const parts = str.split(/\s+[-–—]\s+/);
    if (parts[0] && parts[0].length >= 2) {
      str = parts[0].trim();
    }
  }

  // 4. File names: e.g. "Screenrecorder-2026-04-22...mp4"
  if (/\.(mp4|webm|mov|png|jpe?g|webp)$/i.test(str)) {
    str = str.replace(/\.(mp4|webm|mov|png|jpe?g|webp)$/i, '');
    if (/screenrecorder|screenshot/i.test(str)) {
      str = 'Screen Recording';
    }
  }

  // Strip decorative symbols (✦, ★, ✨, 🔥, etc.) and quotes / trailing colons / commas
  str = str.replace(/[✦★✨🔥]/g, '').replace(/\uFFFD/g, '').replace(/^["“'\s]+|["”'\s:,]+$/g, '').trim();

  // If hashtag spam or generic placeholder, fallback to handle or platform
  if (!str || str.startsWith('#') || str.toLowerCase() === 'instagram' || str.toLowerCase() === 'imported_post' || str.toLowerCase() === 'dribbble') {
    return handle ? handle.replace(/^@/, '') : (platform || 'Creator');
  }

  return str;
}

/**
 * Parses numerical count strings like "11K", "91K", "3,846", "1.5M", or raw integers into numbers.
 */
export function parseCount(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = String(val).trim().replace(/,/g, '');
  const match = str.match(/^([\d.]+)\s*([kKmMbB])?$/);
  if (!match) {
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? null : parsed;
  }
  let num = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase();
  if (unit === 'k') num *= 1000;
  else if (unit === 'm') num *= 1000000;
  else if (unit === 'b') num *= 1000000000;
  return Math.round(num);
}

/**
 * Formats a number compactly for the engagement row (e.g. 11K, 3.8K, 207).
 */
export function formatStatCount(num) {
  if (num === null || num === undefined || isNaN(num)) return null;
  if (num >= 1000000) {
    const val = (num / 1000000).toFixed(1).replace(/\.0$/, '');
    return `${val}M`;
  }
  if (num >= 1000) {
    const val = (num / 1000).toFixed(1).replace(/\.0$/, '');
    return `${val}K`;
  }
  return num.toLocaleString();
}

/**
 * Parses rich social metadata from post records for Layout 1 display:
 * Avatar, Display Name, @handle, 2-line description, Likes, Comments, and Date.
 * Strips likes, comments, and author-date prefixes completely from the description row.
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

  // 1. Social metadata extraction from description (Instagram, Threads, etc.)
  // Pattern A: Likes + Comments + Handle + Date:
  // e.g. "11K likes, 207 comments - arreeeyaarrr on June 22, 2026: \"...\""
  const matchA = cleanDesc.match(/^([\d,.]+[kKmMbB]?)\s+likes,\s+([\d,.]+[kKmMbB]?)\s+comments\s*-\s*([^\s]+)\s+on\s+([^:]+):\s*["“]?([\s\S]*)$/i);
  if (matchA) {
    if (likes === null) likes = parseCount(matchA[1]);
    if (comments === null) comments = parseCount(matchA[2]);
    handle = '@' + matchA[3].replace(/^@/, '');
    postDate = matchA[4].trim();
    cleanDesc = matchA[5];
  } else {
    // Pattern B: Likes + Handle + Date (no comments):
    const matchB = cleanDesc.match(/^([\d,.]+[kKmMbB]?)\s+likes\s*-\s*([^\s]+)\s+on\s+([^:]+):\s*["“]?([\s\S]*)$/i);
    if (matchB) {
      if (likes === null) likes = parseCount(matchB[1]);
      handle = '@' + matchB[2].replace(/^@/, '');
      postDate = matchB[3].trim();
      cleanDesc = matchB[4];
    } else {
      // Pattern C: Likes + Comments + Handle (no date):
      const matchC = cleanDesc.match(/^([\d,.]+[kKmMbB]?)\s+likes,\s+([\d,.]+[kKmMbB]?)\s+comments\s*-\s*([^\s:]+):\s*["“]?([\s\S]*)$/i);
      if (matchC) {
        if (likes === null) likes = parseCount(matchC[1]);
        if (comments === null) comments = parseCount(matchC[2]);
        handle = '@' + matchC[3].replace(/^@/, '');
        cleanDesc = matchC[4];
      } else {
        // Pattern D: Likes only (no comments, no date):
        const matchD = cleanDesc.match(/^([\d,.]+[kKmMbB]?)\s+likes\s*-\s*([^\s:]+):\s*["“]?([\s\S]*)$/i);
        if (matchD) {
          if (likes === null) likes = parseCount(matchD[1]);
          handle = '@' + matchD[2].replace(/^@/, '');
          cleanDesc = matchD[3];
        } else {
          // Pattern E: Author on Date (no likes/comments):
          // e.g. "sumedhhkumar.ai on July 27, 2026: \"...\""
          const matchE = cleanDesc.match(/^([a-zA-Z0-9_.]+)\s+on\s+([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?):\s*["“]?([\s\S]*)$/i);
          if (matchE) {
            if (!handle) handle = '@' + matchE[1].replace(/^@/, '');
            postDate = matchE[2].trim();
            cleanDesc = matchE[3];
          }
        }
      }
    }
  }

  // 2. Author and handle extraction from post.username
  let rawUsername = decodeHtmlEntities(post.username || '').trim();

  // Extract handle from username if present: e.g. "Romario (@bateshkaaa) on X"
  const xMatch = rawUsername.match(/\((@[a-zA-Z0-9_.]+)\)/);
  if (xMatch && !handle) {
    handle = xMatch[1];
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

  // Clean creator display name strictly to the creator's actual name
  displayName = cleanCreatorName(rawUsername, displayPlatform, handle);

  if (!displayName) {
    displayName = handle ? handle.replace(/^@/, '') : 'Creator';
  }

  // 3. Robust Description Sanitization
  // Strip any remaining likes/comments counts or author/date prefixes
  cleanDesc = cleanDesc
    .replace(/^[\d,.]+[kKmMbB]?\s+likes[,\s\d.kKmMbB]*comments\s*-\s*[^:]+:\s*["“]?/i, '')
    .replace(/^[\d,.]+[kKmMbB]?\s+likes\s*-\s*[^:]+:\s*["“]?/i, '')
    .replace(/^[a-zA-Z0-9_.]+\s+on\s+[A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?:\s*["“]?/i, '');

  // Strip Dribbble boilerplate and author credit
  cleanDesc = cleanDesc.replace(/\.?\s*Connect with them on Dribbble;?[\s\S]*$/i, '');
  cleanDesc = cleanDesc.replace(/\s+designed by\s+.*$/i, '');

  // Strip Telegram auto-save & metadata tags
  cleanDesc = cleanDesc
    .replace(/^Auto-saved via Telegram\.?/i, '')
    .replace(/^\[Tags:[^\]]+\]\s*/i, '')
    .replace(/^["“'\s]+|["”'\s]+$/g, '')
    .trim();

  // If description was just title or identical to username, clear it
  if (cleanDesc.toLowerCase() === displayName.toLowerCase() || cleanDesc.toLowerCase() === rawUsername.toLowerCase()) {
    cleanDesc = '';
  }

  // 4. Determine clearly distinguished date
  // If postDate is available -> relative post date e.g. "6d ago" or "Oct 9"
  // If created_at is available -> relative saved date e.g. "Saved 1w ago"
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

/**
 * Permanently deletes multiple posts from ui_tastes and cleans associated media from storage
 * only when the media is not shared by other posts.
 * @param {Array<Object>} posts - Array of post objects to delete
 * @returns {Promise<{ count: number, error: any }>}
 */
export async function deleteMultipleTastesFromDB(posts) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return { count: 0, error: new Error('No posts provided for deletion') };
  }

  const postIds = posts.map(p => p.id).filter(Boolean);
  if (postIds.length === 0) {
    return { count: 0, error: new Error('Invalid post IDs') };
  }

  try {
    // 1. Collect all storage media & thumbnail URLs from the target posts
    const candidateUrls = new Set();
    posts.forEach(p => {
      if (p.media_url && typeof p.media_url === 'string' && p.media_url.includes('/submissions/')) {
        candidateUrls.add(p.media_url);
      }
      if (p.thumbnail_url && typeof p.thumbnail_url === 'string' && p.thumbnail_url.includes('/submissions/')) {
        candidateUrls.add(p.thumbnail_url);
      }
    });

    // 2. Verify files are not shared by other posts outside this batch
    const filesToRemove = [];
    for (const url of candidateUrls) {
      try {
        const { data: sharedPosts } = await supabase
          .from('ui_tastes')
          .select('id')
          .eq('media_url', url)
          .not('id', 'in', `(${postIds.join(',')})`)
          .limit(1);

        if (!sharedPosts || sharedPosts.length === 0) {
          const { data: sharedSections } = await supabase
            .from('website_sections')
            .select('id')
            .eq('image_url', url)
            .limit(1);

          if (!sharedSections || sharedSections.length === 0) {
            const parts = url.split('/submissions/');
            if (parts[1]) {
              const storagePath = decodeURIComponent(parts[1].split('?')[0]);
              filesToRemove.push(storagePath);
            }
          }
        }
      } catch (checkErr) {
        console.warn('[deleteMultipleTastesFromDB] Storage ref check warning:', checkErr);
      }
    }

    if (filesToRemove.length > 0) {
      try {
        await supabase.storage.from('submissions').remove(filesToRemove);
      } catch (removeErr) {
        console.warn('[deleteMultipleTastesFromDB] Storage remove warning:', removeErr);
      }
    }

    // 3. Batch delete posts from ui_tastes table
    const { error } = await supabase
      .from('ui_tastes')
      .delete()
      .in('id', postIds);

    if (error) throw error;
    return { count: postIds.length, error: null };
  } catch (err) {
    console.error('[deleteMultipleTastesFromDB] Error deleting posts:', err);
    return { count: 0, error: err };
  }
}

