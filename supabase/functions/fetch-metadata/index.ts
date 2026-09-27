import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const document = new DOMParser().parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML");
    }

    const getMetaContent = (name: string, property: string) => {
      const el = document.querySelector(`meta[name="${name}"], meta[property="${property}"]`);
      return el ? el.getAttribute('content') : '';
    };

    const title = getMetaContent('title', 'og:title') || document.title || '';
    const description = getMetaContent('description', 'og:description') || '';
    
    let imageUrl = getMetaContent('image', 'og:image') || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      const urlObj = new URL(url);
      imageUrl = new URL(imageUrl, urlObj.origin).toString();
    }

    let logoUrl = '';
    const iconEl = document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    if (iconEl) {
      logoUrl = iconEl.getAttribute('href') || '';
      if (logoUrl && !logoUrl.startsWith('http')) {
        const urlObj = new URL(url);
        logoUrl = new URL(logoUrl, urlObj.origin).toString();
      }
    } else {
      // Fallback to default favicon.ico
      const urlObj = new URL(url);
      logoUrl = `${urlObj.origin}/favicon.ico`;
    }

    return new Response(
      JSON.stringify({ title, description, imageUrl, logoUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
