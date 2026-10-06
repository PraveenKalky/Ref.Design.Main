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
    const { imageUrl, imageBase64, mimeType: clientMimeType } = await req.json();

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    let base64Data = "";
    let mimeType = clientMimeType || "image/png";

    if (imageBase64) {
      // Robustly strip data URL prefix regardless of mime extension or headers
      base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    } else if (imageUrl) {
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok) {
        throw new Error(`Failed to fetch image: ${imageResp.statusText}`);
      }
      const arrayBuffer = await imageResp.arrayBuffer();
      base64Data = encode(arrayBuffer);
      mimeType = imageResp.headers.get('content-type') || mimeType;
    } else {
      throw new Error("Either imageBase64 or imageUrl is required");
    }

    const prompt = "You are an expert UI/UX designer. Look at this screenshot and identify the specific UI component or page shown. Is it a crypto trading terminal, BTC perpetual contract modal, deposit modal, pricing tier card, login form, etc? Return a 3-5 word descriptive semantic title for this image, such as 'BTC Perpetual Trading Screen' or 'Deposit Perpetual Modal'. Return ONLY the title. Do not include quotes, markdown, or any extra text.";

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 30
      }
    };

    // Preferred fast vision models
    const primaryModels = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash-exp"
    ];

    let geminiResp: Response | null = null;
    let lastError = "";

    // 1. Quick attempt with fast known models
    for (const modelName of primaryModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
      try {
        const resp = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          geminiResp = resp;
          break;
        } else {
          lastError = await resp.text();
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    // 2. If primary models failed, dynamically fetch account's supported models list as fallback
    if (!geminiResp) {
      try {
        const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        if (listResp.ok) {
          const listData = await listResp.json();
          const availableModels = (listData.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => m.name.replace(/^models\//, ""));

          for (const modelName of availableModels) {
            if (primaryModels.includes(modelName)) continue;
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
            try {
              const resp = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              });
              if (resp.ok) {
                geminiResp = resp;
                break;
              }
            } catch (e) {
              // ignore and try next
            }
          }
        }
      } catch (e) {
        console.warn("Failed to fetch model list:", e);
      }
    }

    if (!geminiResp) {
      throw new Error(`Gemini API error: ${lastError}`);
    }

    const data = await geminiResp.json();
    let label = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up response: if multiline, extract final clean line
    const lines = label.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      label = lines[lines.length - 1];
    }

    label = label.replace(/['"`]/g, '').trim();

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
