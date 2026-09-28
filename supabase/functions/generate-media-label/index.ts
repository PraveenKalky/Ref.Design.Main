import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      throw new Error("imageUrl is required");
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    // 1. Fetch the image from the provided public URL
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) {
      throw new Error(`Failed to fetch image: ${imageResp.statusText}`);
    }
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Image = encode(arrayBuffer);
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    // 2. Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
    
    // Improved prompt to specifically identify UI components
    const prompt = "You are an expert UI/UX designer. Look at this screenshot and identify the specific UI component shown. Is it a full-page, a modal popup, a pricing card, a form, a hero section, etc? Return a 3-5 word descriptive semantic label for this image, such as 'Deposit Perpetual Modal', 'Pricing Tier Card', or 'Crypto Trading Dashboard'. Return ONLY the label. Do not include quotes, markdown, or any extra text.";

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2
      }
    };

    const geminiResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      throw new Error(`Gemini API error: ${errText}`);
    }

    const data = await geminiResp.json();
    let label = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up label (remove any surrounding quotes or newlines)
    label = label.replace(/['"]/g, '').trim();

    return new Response(JSON.stringify({ label }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error generating label:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
