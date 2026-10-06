import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SECTION_TYPES = [
  'Hero',
  'Navigation',
  'Header',
  'Bento Grid',
  'Features',
  'Product Showcase',
  'Video Showcase',
  'Logo Cloud',
  'Testimonials',
  'Reviews & Ratings',
  'Stats',
  'Comparison',
  'Pricing',
  'Paywall & Plans',
  'CTA',
  'Authentication',
  'Contact Form',
  'Newsletter & Email',
  'FAQ',
  'Footer',
  'Other'
]

const WEBSITE_CATEGORIES = {
  'Categories': [
    'Agencies & Consultancies', 'Typographic', 'Design & Art Direction',
    'Portfolio', 'Web & Interactive Design', 'E-Commerce', 'Fashion', 'Trading'
  ],
  'Popular Categories': [
    'Agencies & Consultancies', 'Typographic', 'Design & Art Direction',
    'Portfolio', 'Web & Interactive Design', 'E-Commerce', 'Fashion',
    'Minimal', 'Grid Layout', 'Unusual Layout', 'Art', 'Use of Animation', 'Trading'
  ],
  'Styles': [
    'Clean', 'Dark', 'Colorful', 'Brutalism', 'Glassmorphism', 'Neumorphism', 'Retro', 'Minimalist'
  ],
  'Types': [
    'Landing Page', 'Web App', 'Blog', 'Corporate', 'Directory', 'Documentation', 'E-Commerce', 'Portfolio'
  ],
  'Subjects': [
    'Technology', 'Design', 'Finance', 'Healthcare', 'Education', 'Entertainment', 'Travel', 'Food'
  ],
  'Platforms': [
    'Web', 'Mobile', 'Desktop', 'iOS', 'Android', 'macOS', 'Windows', 'Linux'
  ],
  'Tags': [
    'Minimal', 'Grid Layout', 'Unusual Layout', 'Art', 'Use of Animation', 'Dark Mode'
  ],
  'Fonts': [
    'Inter', 'Roboto', 'Outfit', 'Playfair Display', 'Oswald', 'Lora'
  ],
  'Colors': [
    'Monochrome', 'Pastel', 'Neon', 'Earthy', 'Vibrant'
  ],
  'Technologies': [
    'React', 'Next.js', 'Vue', 'Nuxt', 'Svelte', 'Three.js', 'WebGL', 'GSAP'
  ]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // GET: taxonomy metadata
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        categories: WEBSITE_CATEGORIES,
        sectionTypes: SECTION_TYPES
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const secretKey = Deno.env.get('EXTENSION_SECRET_KEY') || 'default-secret-key-change-me'
    if (authHeader !== `Bearer ${secretKey}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid extension secret key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await req.formData()
    const metadataRaw = formData.get('metadata')
    const screenshot = formData.get('screenshot') as File | null

    if (!metadataRaw) {
      return new Response(
        JSON.stringify({ error: 'Missing metadata in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const metadata = JSON.parse(metadataRaw.toString())
    const rawUrl = metadata.url || ''
    if (!rawUrl) {
      return new Response(
        JSON.stringify({ error: 'Website URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalisedUrl = rawUrl
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/+$/, '')
      .toLowerCase()

    const mode = metadata.mode || 'website'

    // Helper: Find or create parent website record
    const getOrCreateWebsite = async (customThumbnailUrl?: string) => {
      const { data: existing } = await supabase
        .from('submissions')
        .select('*')
        .eq('normalised_url', normalisedUrl)
        .maybeSingle()

      if (existing) return existing

      const newSite = {
        title: metadata.title || normalisedUrl,
        url: rawUrl,
        normalised_url: normalisedUrl,
        description: metadata.description || '',
        image_url: customThumbnailUrl || '',
        thumbnail_url: customThumbnailUrl || '',
        logo_url: metadata.ogImage || '',
        categories: metadata.category ? [metadata.category] : [],
        status: 'Approved'
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('submissions')
        .insert([newSite])
        .select()
        .single()

      if (insertErr) throw insertErr
      return inserted
    }

    // ──────────────────────────────────────────────
    // 1. UPDATE THUMBNAIL ONLY (Goal 1)
    // ──────────────────────────────────────────────
    if (mode === 'update_thumbnail') {
      if (!screenshot) throw new Error('Missing screenshot file for thumbnail update')

      const fileName = `thumbnails/${Date.now()}-${metadata.title?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png`
      const { error: storageError } = await supabase.storage
        .from('submissions')
        .upload(`extension-captures/${fileName}`, screenshot, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true
        })

      if (storageError) throw new Error(`Storage upload error: ${storageError.message}`)

      const { data: publicUrlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(`extension-captures/${fileName}`)
      const thumbnailUrl = publicUrlData.publicUrl

      const parentWebsite = await getOrCreateWebsite(thumbnailUrl)

      const { data: updatedWebsite, error: updateError } = await supabase
        .from('submissions')
        .update({
          thumbnail_url: thumbnailUrl,
          image_url: thumbnailUrl // Keep image_url synchronized for card components
        })
        .eq('id', parentWebsite.id)
        .select()
        .single()

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'update_thumbnail',
          thumbnail_url: thumbnailUrl,
          data: updatedWebsite
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ──────────────────────────────────────────────
    // 2. CAPTURE FULL PAGE ONLY (Goal 2)
    // ──────────────────────────────────────────────
    if (mode === 'fullpage') {
      if (!screenshot) throw new Error('Missing screenshot file for full-page capture')

      const fileName = `fullpages/${Date.now()}-${metadata.title?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png`
      const { error: storageError } = await supabase.storage
        .from('submissions')
        .upload(`extension-captures/${fileName}`, screenshot, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true
        })

      if (storageError) throw new Error(`Storage upload error: ${storageError.message}`)

      const { data: publicUrlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(`extension-captures/${fileName}`)
      const fullpageUrl = publicUrlData.publicUrl

      const parentWebsite = await getOrCreateWebsite()

      const { data: updatedWebsite, error: updateError } = await supabase
        .from('submissions')
        .update({ fullpage_image_url: fullpageUrl })
        .eq('id', parentWebsite.id)
        .select()
        .single()

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'fullpage',
          fullpage_image_url: fullpageUrl,
          data: updatedWebsite
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ──────────────────────────────────────────────
    // 3. CAPTURE SECTION & PAGE (Goal 3 & Manual Section)
    // ──────────────────────────────────────────────
    if (mode === 'section') {
      if (!screenshot) throw new Error('Missing screenshot file for section capture')

      const sectionType = metadata.sectionType || 'Other'
      const fileName = `sections/${Date.now()}-${sectionType}-${metadata.title?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png`

      const { error: storageError } = await supabase.storage
        .from('submissions')
        .upload(`extension-captures/${fileName}`, screenshot, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw new Error(`Storage error: ${storageError.message}`)

      const { data: publicUrlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(`extension-captures/${fileName}`)
      const sectionImageUrl = publicUrlData.publicUrl

      const parentWebsite = await getOrCreateWebsite(sectionImageUrl)

      // Find or create website_pages record if page metadata exists
      let pageId: string | null = null
      if (metadata.pageUrl) {
        try {
          const pageUrlObj = new URL(metadata.pageUrl)
          const slug = pageUrlObj.pathname || '/'
          const pageTitle = metadata.pageTitle || metadata.title || slug

          const { data: existingPage } = await supabase
            .from('website_pages')
            .select('id')
            .eq('website_id', parentWebsite.id)
            .eq('slug', slug)
            .maybeSingle()

          if (existingPage) {
            pageId = existingPage.id
          } else {
            const { data: newPage } = await supabase
              .from('website_pages')
              .insert([{
                website_id: parentWebsite.id,
                url: metadata.pageUrl,
                slug: slug,
                path: slug,
                page_title: pageTitle,
                page_type: metadata.pageType || 'page'
              }])
              .select('id')
              .single()

            if (newPage) pageId = newPage.id
          }
        } catch (pageErr) {
          console.warn('Page record sync warning:', pageErr)
        }
      }

      // Insert record into public.website_sections
      const sectionPayload: Record<string, any> = {
        website_id: parentWebsite.id,
        section_type: sectionType,
        section_title: metadata.sectionTitle || `${metadata.title || normalisedUrl} - ${sectionType}`,
        image_url: sectionImageUrl,
        page_url: metadata.pageUrl || rawUrl,
        status: 'Approved'
      }

      if (pageId) sectionPayload.page_id = pageId

      const { data: sectionData, error: sectionDbError } = await supabase
        .from('website_sections')
        .insert([sectionPayload])
        .select()
        .single()

      if (sectionDbError) throw sectionDbError

      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: 'section',
          data: sectionData,
          parentWebsite: parentWebsite
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ──────────────────────────────────────────────
    // 4. FULL WEBSITE CAPTURE (Legacy & Full Save)
    // ──────────────────────────────────────────────
    const fileName = `${Date.now()}-${metadata.title?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png`

    let imageUrl = ''
    if (screenshot) {
      const { error: storageError } = await supabase.storage
        .from('submissions')
        .upload(`extension-captures/${fileName}`, screenshot, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw new Error(`Storage upload error: ${storageError.message}`)

      const { data: publicUrlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(`extension-captures/${fileName}`)
      imageUrl = publicUrlData.publicUrl
    }

    const categoriesArray = Array.from(
      new Set(
        [metadata.category, ...(Array.isArray(metadata.tags) ? metadata.tags : [])]
          .filter(Boolean)
          .map((c: string) => c.trim())
      )
    )

    const websitePayload: Record<string, any> = {
      title: metadata.title || 'Untitled',
      url: rawUrl,
      normalised_url: normalisedUrl,
      description: metadata.description || '',
      logo_url: metadata.ogImage || '',
      categories: categoriesArray,
      status: 'Approved',
    }

    if (imageUrl) {
      websitePayload.image_url = imageUrl
      websitePayload.thumbnail_url = imageUrl
    }

    const { data: existingWebsite } = await supabase
      .from('submissions')
      .select('id')
      .eq('normalised_url', normalisedUrl)
      .maybeSingle()

    let websiteData = null
    if (existingWebsite) {
      const { data: updated, error: updateError } = await supabase
        .from('submissions')
        .update(websitePayload)
        .eq('id', existingWebsite.id)
        .select()
        .single()
      if (updateError) throw updateError
      websiteData = updated
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('submissions')
        .insert([websitePayload])
        .select()
        .single()
      if (insertError) throw insertError
      websiteData = inserted
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mode: 'website',
        data: websiteData 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Capture Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
