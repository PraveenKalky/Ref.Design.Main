import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
// Get from: https://dribbble.com/account/applications → register app → copy Access Token
const DRIBBBLE_ACCESS_TOKEN = Deno.env.get('DRIBBBLE_ACCESS_TOKEN')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Strategy 0: Scraper WAF Bypass (Option A) ──────────────────────────────
async function tryScrapingService(url: string): Promise<string | null> {
  const apiKey = Deno.env.get('SCRAPING_API_KEY');
  if (!apiKey) {
    console.warn('[scraping-service] SCRAPING_API_KEY environment variable is not set.');
    return null;
  }

  const provider = Deno.env.get('SCRAPING_PROVIDER') || 'scrapingbee';
  let scrapeUrl = '';

  if (provider === 'zenrows' || apiKey.startsWith('zr_') || apiKey.length === 40) {
    scrapeUrl = `https://api.zenrows.com/v1/?apikey=${apiKey}&url=${encodeURIComponent(url)}`;
  } else if (provider === 'scraperapi' || apiKey.length === 32) {
    scrapeUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;
  } else {
    scrapeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=false&stealth_proxy=true`;
  }

  try {
    console.log(`[scraping-service] Fetching Dribbble via ${provider}...`);
    const res = await fetch(scrapeUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.error(`[scraping-service] HTTP error ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.error('[scraping-service] Error:', e.message);
    return null;
  }
}

function extractDribbbleImage(html: string): string | null {
  // Check og:image or twitter:image tags for exact shot image
  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^">]+)"/i) ||
                  html.match(/<meta[^>]+content="([^">]+)"[^>]+property="og:image"/i) ||
                  html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^">]+)"/i) ||
                  html.match(/<meta[^>]+content="([^">]+)"[^>]+name="twitter:image"/i);
                  
  if (ogMatch && ogMatch[1]) {
    const cleanUrl = decodeHTMLEntities(ogMatch[1].trim());
    if (!cleanUrl.includes('logo') && !cleanUrl.includes('avatar') && !cleanUrl.includes('assets/')) {
      return cleanUrl;
    }
  }

  return null;
}

// ─── Strategy 0.1: Dribbble Official API ───────────────────────────────────────
// Dribbble blocks ALL scrapers (Cloudflare WAF on datacenter IPs).
// The only way to get real thumbnails is their official API v2.
// Token setup: https://dribbble.com/account/applications → register → copy "Access Token"
async function tryDribbbleAPI(url: string): Promise<string | null> {
  if (!DRIBBBLE_ACCESS_TOKEN) return null;

  // Extract shot ID from URL patterns:
  // https://dribbble.com/shots/12345678
  // https://dribbble.com/shots/12345678-shot-title
  const match = url.match(/dribbble\.com\/shots\/(\d+)/);
  if (!match) return null;

  const shotId = match[1];
  try {
    const res = await fetch(`https://api.dribbble.com/v2/shots/${shotId}`, {
      headers: {
        'Authorization': `Bearer ${DRIBBBLE_ACCESS_TOKEN}`,
        'User-Agent': 'RefDesign/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[dribbble-api] HTTP ${res.status} for shot ${shotId}`);
      return null;
    }
    const json = await res.json();
    // Prefer hi-dpi → normal → teaser
    return json.images?.hidpi || json.images?.normal || json.images?.teaser || null;
  } catch (e) {
    console.error('[dribbble-api] Error:', e);
    return null;
  }
}

// ─── Strategy 1: noembed (oEmbed aggregator) ─────────────────────────────────
// Works for: YouTube, Vimeo, Twitter/X (sometimes), Instagram (sometimes)
// Does NOT work for: Dribbble, Behance, LinkedIn
async function tryNoembed(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RefDesign/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.error) return null; // "no matching providers found"
    if (json.thumbnail_url) return json.thumbnail_url;
    if (json.html) {
      const m = json.html.match(/src="([^"]+\.(jpg|jpeg|png|webp|gif)[^"]*)"/i);
      if (m) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Strategy 2: Microlink API ───────────────────────────────────────────────
// Works for most public pages. Skip base64 blobs (returned for Behance).
// NOTE: Dribbble returns HTTP 400 from Microlink — it is explicitly blocklisted.
async function tryMicrolink(url: string): Promise<{ mediaUrl: string | null; description: string | null; title: string | null; isVideo: boolean }> {
  // Don't even try Dribbble — Microlink returns 400 for it
  if (url.includes('dribbble.com')) {
    return { mediaUrl: null, description: null, title: null, isVideo: false };
  }

  try {
    const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RefDesign/1.0)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { mediaUrl: null, description: null, title: null, isVideo: false };
    const json = await res.json();
    if (json.status !== 'success' || !json.data) {
      return { mediaUrl: null, description: null, title: null, isVideo: false };
    }
    const d = json.data;
    // Skip base64 blobs entirely — they can't be used as <img src>
    let mediaUrl: string | null = null;
    if (d.image?.url && !d.image.url.startsWith('data:')) mediaUrl = d.image.url;

    return {
      mediaUrl,
      description: d.description || null,
      title: d.title ? d.title.substring(0, 80) : null,
      isVideo: !!d.video,
    };
  } catch {
    return { mediaUrl: null, description: null, title: null, isVideo: false };
  }
}

// ─── Strategy 3: Direct HTML OGP fetch ───────────────────────────────────────
// Works for: Behance, many public pages
// Fails for: Dribbble (Cloudflare WAF blocks datacenter IPs), X, Instagram
async function tryDirectFetch(url: string): Promise<{ mediaUrl: string | null; description: string | null; title: string | null }> {
  // Dribbble WAF blocks all datacenter/cloud IPs — skip to avoid wasting timeout
  if (url.includes('dribbble.com')) {
    return { mediaUrl: null, description: null, title: null };
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { mediaUrl: null, description: null, title: null };
    const html = await res.text();

    const ogImgMatch =
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^">]+)"/i) ||
      html.match(/<meta[^>]+content="([^">]+)"[^>]+property="og:image"/i) ||
      html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^">]+)"/i) ||
      html.match(/<meta[^>]+name="twitter:image:src"[^>]+content="([^">]+)"/i);

    const ogDescMatch =
      html.match(/<meta[^>]+property="og:description"[^>]+content="([^">]+)"/i) ||
      html.match(/<meta[^>]+name="description"[^>]+content="([^">]+)"/i);

    const titleMatch =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^">]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    const mediaUrl = ogImgMatch?.[1] ? decodeHTMLEntities(ogImgMatch[1]) : null;
    const description = ogDescMatch?.[1] ? decodeHTMLEntities(ogDescMatch[1]) : null;
    const title = titleMatch?.[1] ? titleMatch[1].trim().substring(0, 80) : null;

    return { mediaUrl, description, title };
  } catch {
    return { mediaUrl: null, description: null, title: null };
  }
}

// ─── Strategy 4: thum.io screenshot (last resort, free, no auth) ─────────────
// thum.io takes a real browser screenshot of any URL and returns a JPEG.
// Free tier: up to 100 screenshots/month. Works even when pages block scrapers
// because it runs a real headless browser, not a datacenter HTTP request.
// URL format: https://image.thum.io/get/width/800/{url}
function getThumioUrl(url: string): string {
  const cleanUrl = url.split('?')[0];
  return `https://image.thum.io/get/delay/7/width/800/crop/600/${cleanUrl}`;
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// ─── Master metadata fetcher ─────────────────────────────────────────────────
async function fetchMetadata(url: string): Promise<{
  mediaUrl: string | null;
  description: string;
  title: string;
  isVideo: boolean;
  fetchMethod: string;
  error: string | null;
}> {
  let description = 'Auto-saved via Telegram.';
  let title = 'imported_post';
  let isVideo = false;
  let mediaUrl: string | null = null;
  let fetchMethod = 'none';
  const errors: string[] = [];

  const isDribbble = url.includes('dribbble.com');

  // ── Strategy 0: Dribbble Scraper / API ──
  if (isDribbble) {
    const scraperHtml = await tryScrapingService(url);
    if (scraperHtml) {
      const extractedImg = extractDribbbleImage(scraperHtml);
      if (extractedImg) {
        mediaUrl = extractedImg;
        fetchMethod = 'dribbble-scraper';
        console.log(`[dribbble-scraper] Got thumbnail: ${mediaUrl}`);
        
        // Try extracting metadata (title and description)
        const titleMatch = scraperHtml.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim().replace(/\s*\|\s*Dribbble.*/i, '');
        }
        const descMatch = scraperHtml.match(/<meta[^>]+name="description"[^>]+content="([^">]+)"/i) ||
                          scraperHtml.match(/<meta[^>]+property="og:description"[^>]+content="([^">]+)"/i);
        if (descMatch) {
          description = decodeHTMLEntities(descMatch[1].trim());
        }
      } else {
        errors.push('dribbble-scraper: No shot image found in returned HTML');
      }
    } else {
      errors.push('dribbble-scraper: Scraper API call returned empty or failed');
    }

    if (!mediaUrl) {
      const dribbbleUrl = await tryDribbbleAPI(url);
      if (dribbbleUrl) {
        mediaUrl = dribbbleUrl;
        fetchMethod = 'dribbble-api';
        console.log(`[dribbble-api] Got thumbnail: ${mediaUrl}`);
      } else {
        errors.push(
          DRIBBBLE_ACCESS_TOKEN
            ? 'dribbble-api: API call failed (invalid token or shot not found)'
            : 'dribbble-api: DRIBBBLE_ACCESS_TOKEN not set in Supabase secrets'
        );
      }
    }
  }

  // ── Strategy 1: noembed (skip Dribbble — returns "no matching providers") ──
  if (!mediaUrl && !isDribbble) {
    const noembedUrl = await tryNoembed(url);
    if (noembedUrl) {
      mediaUrl = noembedUrl;
      fetchMethod = 'noembed';
      console.log(`[noembed] Got thumbnail: ${mediaUrl}`);
    } else {
      errors.push('noembed: no matching provider or no thumbnail_url');
    }
  }

  // ── Strategy 2: Microlink (skip Dribbble — returns HTTP 400) ──
  if (!mediaUrl && !isDribbble) {
    const ml = await tryMicrolink(url);
    if (ml.mediaUrl) {
      mediaUrl = ml.mediaUrl;
      fetchMethod = 'microlink';
      console.log(`[microlink] Got thumbnail: ${mediaUrl}`);
    } else {
      errors.push('microlink: image null or base64 blob');
    }
    if (ml.description) description = ml.description;
    if (ml.title) title = ml.title;
    isVideo = ml.isVideo;
  }

  // ── Strategy 3: Direct OGP (skip Dribbble — Cloudflare WAF blocks datacenter IPs) ──
  if (!mediaUrl && !isDribbble) {
    const direct = await tryDirectFetch(url);
    if (direct.mediaUrl) {
      mediaUrl = direct.mediaUrl;
      fetchMethod = 'direct-ogp';
      console.log(`[direct-ogp] Got thumbnail: ${mediaUrl}`);
    } else {
      errors.push('direct-ogp: no og:image found or page blocked scraping');
    }
    if (!description && direct.description) description = direct.description;
    if (title === 'imported_post' && direct.title) title = direct.title;
  }

  // ── Strategy 4: thum.io screenshot (last resort for Dribbble without API token, or any other failure) ──
  if (!mediaUrl && !isDribbble) {
    mediaUrl = getThumioUrl(url);
    fetchMethod = 'screenshot-thumio';
    console.log(`[thum.io] Using screenshot fallback: ${mediaUrl}`);
    errors.push('screenshot-thumio: using page screenshot since direct thumbnail unavailable');
  }

  const errorSummary = !mediaUrl
    ? `Could not fetch real thumbnail: ${errors.join(' | ')}`
    : null;

  if (errorSummary) {
    console.warn(`[fetchMetadata] Error for ${url}: ${errorSummary}`);
  }

  return { mediaUrl, description, title, isVideo, fetchMethod, error: errorSummary };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle image proxy requests
  const urlObj = new URL(req.url);
  let proxyUrl = urlObj.searchParams.get('proxy');
  if (proxyUrl) {
    try {
      // Decode encoded slashes in thum.io URLs to avoid Tomcat 400 Bad Request
      if (proxyUrl.includes('thum.io') && (proxyUrl.includes('%3A') || proxyUrl.includes('%2F'))) {
        proxyUrl = decodeURIComponent(proxyUrl);
      }
      console.log(`[proxy] Fetching image from: ${proxyUrl}`);
      const imageRes = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });
      if (!imageRes.ok) {
        throw new Error(`Failed to fetch image: ${imageRes.status}`);
      }
      const blob = await imageRes.blob();
      const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
      return new Response(blob, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        }
      });
    } catch (e) {
      console.error('[proxy] Error proxying image:', e.message);
      return new Response('Failed to proxy image', { status: 500, headers: corsHeaders });
    }
  }


  try {
    const body = await req.json();

    // ── Scenario 1: React frontend direct metadata request ──
    if (body.url && !body.message) {
      console.log(`[frontend] Request for: ${body.url}`);
      
      let meta;
      if (body.metadata) {
        console.log(`[frontend] Using client-provided metadata:`, body.metadata);
        meta = {
          mediaUrl: body.metadata.mediaUrl,
          title: body.metadata.title,
          description: body.metadata.description,
          isVideo: !!body.metadata.isVideo,
          fetchMethod: 'extension-helper',
          error: null
        };
      } else {
        console.log(`[frontend] Scraping server-side for: ${body.url}`);
        meta = await fetchMetadata(body.url);
      }

      if (body.id) {
        console.log(`[frontend] Updating post ${body.id} in DB...`);
        const { error } = await supabase
          .from('ui_tastes')
          .update({
            media_url: meta.mediaUrl,
            username: meta.title,
            description: meta.description,
            is_video: meta.isVideo
          })
          .eq('id', body.id);
        if (error) {
          console.error(`[frontend] DB update failed for ${body.id}:`, error.message);
        } else {
          console.log(`[frontend] DB update succeeded for ${body.id}`);
        }
      }

      if (body.insert) {
        console.log(`[frontend] Inserting new post into DB for URL: ${body.url}`);
        
        let platform = 'Web';
        if (body.url.includes('dribbble.com')) platform = 'Dribbble';
        else if (body.url.includes('twitter.com') || body.url.includes('x.com')) platform = 'X';
        else if (body.url.includes('behance.net')) platform = 'Behance';
        else if (body.url.includes('instagram.com')) platform = 'Instagram';
        else if (body.url.includes('linkedin.com')) platform = 'LinkedIn';

        const category = body.category || 'Landing Pages';
        
        const { error } = await supabase
          .from('ui_tastes')
          .insert([{
            url: body.url,
            platform,
            username: meta.title || 'manual_upload',
            description: meta.description || `Manually added ${category} inspiration.`,
            media_url: meta.mediaUrl,
            is_video: meta.isVideo,
            category
          }]);
          
        if (error) {
          console.error(`[frontend] DB insert failed:`, error.message);
          return new Response(
            JSON.stringify({ status: 'error', message: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.log(`[frontend] DB insert succeeded`);
        }
      }

      return new Response(
        JSON.stringify({
          status: 'success',
          data: {
            mediaUrl: meta.mediaUrl,
            description: meta.description,
            title: meta.title,
            isVideo: meta.isVideo,
            fetchMethod: meta.fetchMethod,
          },
          warning: meta.error || undefined,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Scenario 2: Telegram webhook message ──
    const message = body.message;
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;

      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex);

      if (urls && urls.length > 0) {
        const postUrl = urls[0];

        let platform = 'Web';
        if (postUrl.includes('dribbble.com')) platform = 'Dribbble';
        else if (postUrl.includes('twitter.com') || postUrl.includes('x.com')) platform = 'X';
        else if (postUrl.includes('behance.net')) platform = 'Behance';
        else if (postUrl.includes('instagram.com')) platform = 'Instagram';
        else if (postUrl.includes('linkedin.com')) platform = 'LinkedIn';

        const meta = await fetchMetadata(postUrl);

        const { error } = await supabase.from('ui_tastes').insert([{
          url: postUrl,
          platform,
          username: meta.title,
          description: meta.description,
          media_url: meta.mediaUrl,
          is_video: meta.isVideo,
          category: 'Uncategorized'
        }]);

        if (error) throw error;

        const methodLabel: Record<string, string> = {
          'dribbble-api': '🎨 Dribbble API',
          'dribbble-scraper': '🎨 Dribbble Scraper',
          'noembed': '🔗 oEmbed',
          'microlink': '🔍 Microlink',
          'direct-ogp': '📄 OGP tags',
          'screenshot-thumio': '📸 Page screenshot',
        };
        const replyText = `✅ Saved to UI/UX Tastes.\nPlatform: ${platform}\nThumbnail: ${methodLabel[meta.fetchMethod] || meta.fetchMethod}`;

        if (TELEGRAM_BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: replyText }),
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function crashed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
