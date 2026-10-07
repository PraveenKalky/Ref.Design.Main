import { supabase } from '../lib/supabase';
import { sanitizeSectionName } from '../pages/admin/components/PageMediaUploader';

/**
 * Persists a renamed section title to both website_sections table and website_pages media JSON
 */
export const updateSectionTitleInDB = async (sectionItem, rawNewTitle) => {
  const cleanTitle = sanitizeSectionName(rawNewTitle) || rawNewTitle.trim();
  if (!cleanTitle) return false;

  try {
    // 1. Update website_sections table
    let secQuery = supabase.from('website_sections').update({
      section_title: cleanTitle,
      section_type: cleanTitle
    });

    if (sectionItem.id && typeof sectionItem.id === 'string' && !sectionItem.id.startsWith('http')) {
      secQuery = secQuery.eq('id', sectionItem.id);
    } else if (sectionItem.image_url) {
      secQuery = secQuery.eq('image_url', sectionItem.image_url);
    }
    await secQuery;

    // 2. Update website_pages media array if image_url exists
    if (sectionItem.image_url) {
      const { data: pages } = await supabase
        .from('website_pages')
        .select('id, media');

      if (pages && Array.isArray(pages)) {
        for (const page of pages) {
          if (page.media && Array.isArray(page.media)) {
            let updated = false;
            const newMedia = page.media.map(m => {
              const url = typeof m === 'string' ? m : m.url;
              if (url === sectionItem.image_url) {
                updated = true;
                return typeof m === 'string' ? { url: m, title: cleanTitle } : { ...m, title: cleanTitle };
              }
              return m;
            });

            if (updated) {
              await supabase
                .from('website_pages')
                .update({ media: newMedia })
                .eq('id', page.id);
            }
          }
        }
      }
    }
    return cleanTitle;
  } catch (err) {
    console.error('[Section Actions] Error updating section title:', err);
    return cleanTitle;
  }
};

/**
 * Deletes a section asset from website_sections table and website_pages media JSON
 */
export const deleteSectionFromDB = async (sectionItem) => {
  try {
    // 1. Delete row from website_sections
    let secQuery = supabase.from('website_sections').delete();
    if (sectionItem.id && typeof sectionItem.id === 'string' && !sectionItem.id.startsWith('http')) {
      secQuery = secQuery.eq('id', sectionItem.id);
    } else if (sectionItem.image_url) {
      secQuery = secQuery.eq('image_url', sectionItem.image_url);
    }
    await secQuery;

    // 2. Remove media from website_pages media array
    if (sectionItem.image_url) {
      const { data: pages } = await supabase
        .from('website_pages')
        .select('id, media');

      if (pages && Array.isArray(pages)) {
        for (const page of pages) {
          if (page.media && Array.isArray(page.media)) {
            const initialLen = page.media.length;
            const newMedia = page.media.filter(m => {
              const url = typeof m === 'string' ? m : m.url;
              return url !== sectionItem.image_url;
            });

            if (newMedia.length !== initialLen) {
              await supabase
                .from('website_pages')
                .update({ media: newMedia })
                .eq('id', page.id);
            }
          }
        }
      }
    }
    return true;
  } catch (err) {
    console.error('[Section Actions] Error deleting section:', err);
    return false;
  }
};
