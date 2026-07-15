/**
 * fontPathCache.js
 * 
 * Loads Google Font binaries and converts 'Aa' to real SVG path data
 * using opentype.js. Results are cached in memory so each font+weight
 * is only fetched and processed once per browser session.
 *
 * IMPORTANT: Import from the browser ESM build, NOT the main entry.
 * The main entry uses Node's `http`/`fs` modules which crash in browsers.
 */
import * as opentype from 'opentype.js/dist/opentype.min.mjs';

// In-memory cache: "FontName:weight" → { pathData, viewBox }
const pathCache = new Map();
// In-memory pending promises to avoid duplicate in-flight requests
const pendingMap = new Map();

/**
 * Map from Google Font CSS family names to their Google Fonts API ids.
 * Only the fonts used in fontsData.js are listed here.
 */
const FONT_API_IDS = {
  'Inter':              'inter',
  'Playfair Display':   'playfair-display',
  'Space Grotesk':      'space-grotesk',
  'Gothic A1':          'gothic-a1',
  'Plus Jakarta Sans':  'plus-jakarta-sans',
  'Bebas Neue':         'bebas-neue',
  'Newsreader':         'newsreader',
  'Work Sans':          'work-sans',
};

/**
 * Extracts the bare family name from the googleFont CSS string,
 * e.g. "'Inter', sans-serif" → "Inter"
 */
export function extractFamilyName(googleFontString) {
  const match = googleFontString?.match(/['"]?([^'"]+)['"]?/);
  return match ? match[1].trim() : null;
}

/**
 * Fetches the Google Font CSS to extract the woff2 URL,
 * then loads the font binary with fetch() and parses it with
 * opentype.parse() — fully browser-native, no Node http module.
 */
async function loadOpentypeFont(familyName, weight = 400, italic = false) {
  const style = italic ? 'ital,wght@1,' : 'wght@';
  const apiUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyName)}:${style}${weight}&display=swap`;

  // Fetch the Google Fonts CSS to extract the woff2 file URL
  const cssResponse = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'
    }
  });
  if (!cssResponse.ok) throw new Error(`CSS fetch failed for ${familyName}`);
  const css = await cssResponse.text();

  // Extract the last woff2 URL (latin full charset is usually last)
  const urlMatches = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)];
  if (!urlMatches.length) throw new Error(`No woff2 URL in CSS for ${familyName}`);
  const fontUrl = urlMatches[urlMatches.length - 1][1];

  // Fetch the font binary as ArrayBuffer — browser-native, no Node http
  const fontResponse = await fetch(fontUrl);
  if (!fontResponse.ok) throw new Error(`Font binary fetch failed: ${fontUrl}`);
  const arrayBuffer = await fontResponse.arrayBuffer();

  // Parse with opentype — browser-safe path, no fs/http involved
  const font = opentype.parse(arrayBuffer);
  return font;
}

/**
 * Returns an SVG path string for the text 'Aa' in the given font/weight,
 * scaled to fit within a 238×152 viewBox.
 * 
 * Returns: { pathD: string, viewBox: string } or null on error.
 */
export async function getAaPathData(googleFontString, weight = 400, italic = false) {
  const familyName = extractFamilyName(googleFontString);
  if (!familyName) return null;

  const cacheKey = `${familyName}:${weight}:${italic}`;
  if (pathCache.has(cacheKey)) return pathCache.get(cacheKey);

  // Avoid duplicate in-flight fetches
  if (pendingMap.has(cacheKey)) return pendingMap.get(cacheKey);

  const promise = (async () => {
    try {
      const font = await loadOpentypeFont(familyName, weight, italic);

      // Target render size — we render at a large internal size then scale via viewBox
      const fontSize = 120;
      const svgW = 238;
      const svgH = 152;

      // Get the path object for 'Aa' starting at x=0, baseline y=fontSize
      const path = font.getPath('Aa', 0, fontSize, fontSize);
      const pathD = path.toPathData(2);

      // Measure the bounding box of the generated path
      const bbox = path.getBoundingBox();
      const textW = bbox.x2 - bbox.x1;
      const textH = bbox.y2 - bbox.y1;

      // Add padding so ascenders/descenders never clip
      const padX = 16;
      const padY = 12;

      // Compose a viewBox that frames the text exactly with padding
      const vbX = (bbox.x1 - padX).toFixed(2);
      const vbY = (bbox.y1 - padY).toFixed(2);
      const vbW = (textW + padX * 2).toFixed(2);
      const vbH = (textH + padY * 2).toFixed(2);

      const result = {
        pathD,
        viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
        width: svgW,
        height: svgH,
      };

      pathCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn(`[fontPathCache] Could not generate paths for ${familyName}:`, err.message);
      pathCache.set(cacheKey, null); // Cache the failure to avoid retrying
      return null;
    } finally {
      pendingMap.delete(cacheKey);
    }
  })();

  pendingMap.set(cacheKey, promise);
  return promise;
}
