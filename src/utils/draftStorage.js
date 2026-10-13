/**
 * Ref.Design — Reusable Upload Draft Storage System
 * Uses IndexedDB to persist upload drafts containing
 * media files (Images, Videos, GIFs, AVIFs), upload status,
 * and form metadata across sidebar closes, navigation, and page refreshes.
 */

const DB_NAME = 'ref_design_drafts_v1';
const DB_VERSION = 1;
const STORE_NAME = 'media_drafts';

let dbPromise = null;

function getDB() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          }
        };

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.warn('[DraftStorage] IndexedDB open error:', event.target?.error);
          resolve(null);
        };

        request.onblocked = () => {
          console.warn('[DraftStorage] IndexedDB open blocked');
          resolve(null);
        };
      } catch (err) {
        console.warn('[DraftStorage] IndexedDB initialization error:', err);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

/**
 * Save draft data to IndexedDB
 * @param {string} key Unique draft key (e.g. 'section_upload_draft')
 * @param {object} data Draft payload
 * @returns {Promise<boolean>}
 */
export async function saveDraft(key, data) {
  try {
    const db = await getDB();
    if (!db) return false;

    // Sanitize queue for serialization:
    // Strip temporary object URLs because blob: URLs expire across page sessions.
    // IndexedDB stores raw File/Blob instances natively.
    const serializableQueue = Array.isArray(data.queue)
      ? data.queue.map(item => ({
          id: item.id,
          file: item.file || null,
          hash: item.hash || '',
          filename: item.filename || '',
          title: item.title || '',
          category: item.category || 'Hero',
          tags: Array.isArray(item.tags) ? item.tags : [],
          isVideo: Boolean(item.isVideo),
          status: item.status || 'uploading',
          progress: item.progress || 0,
          imageUrl: item.imageUrl || '',
          thumbnailUrl: item.thumbnailUrl || '',
          errorMsg: item.errorMsg || '',
          isClassifying: false,
        }))
      : [];

    const record = {
      key,
      queue: serializableQueue,
      isGroupMode: Boolean(data.isGroupMode),
      coverItemId: data.coverItemId || null,
      collectionTitle: data.collectionTitle || '',
      collectionCategory: data.collectionCategory || 'Hero',
      collectionTags: Array.isArray(data.collectionTags) ? data.collectionTags : [],
      websiteUrl: data.websiteUrl || '',
      tags: data.tags || '',
      description: data.description || '',
      updatedAt: Date.now(),
    };

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => {
        console.warn('[DraftStorage] Failed to save draft:', e.target?.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[DraftStorage] saveDraft error:', err);
    return false;
  }
}

/**
 * Load draft data from IndexedDB
 * Rehydrates preview URLs for media files.
 * @param {string} key Unique draft key
 * @returns {Promise<object|null>}
 */
export async function loadDraft(key) {
  try {
    const db = await getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        const record = req.result;
        if (!record) return resolve(null);

        // Recreate valid live object URLs for stored files
        const rehydratedQueue = Array.isArray(record.queue)
          ? record.queue.map(item => {
              let previewUrl = '';
              if (item.file instanceof Blob || item.file instanceof File) {
                try {
                  previewUrl = URL.createObjectURL(item.file);
                } catch {
                  previewUrl = item.imageUrl || item.thumbnailUrl || '';
                }
              } else {
                previewUrl = item.imageUrl || item.thumbnailUrl || '';
              }

              return {
                ...item,
                previewUrl,
              };
            })
          : [];

        resolve({
          ...record,
          queue: rehydratedQueue,
        });
      };

      req.onerror = (e) => {
        console.warn('[DraftStorage] Failed to load draft:', e.target?.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('[DraftStorage] loadDraft error:', err);
    return null;
  }
}

/**
 * Explicitly clear/discard draft data from IndexedDB
 * @param {string} key Unique draft key
 * @returns {Promise<boolean>}
 */
export async function clearDraft(key) {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('[DraftStorage] clearDraft error:', err);
    return false;
  }
}

/**
 * Check if a non-empty draft exists in IndexedDB
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function hasDraft(key) {
  const draft = await loadDraft(key);
  if (!draft) return false;
  const hasItems = Array.isArray(draft.queue) && draft.queue.length > 0;
  const hasFields = Boolean(
    (draft.websiteUrl && draft.websiteUrl.trim()) ||
    (draft.tags && draft.tags.trim()) ||
    (draft.description && draft.description.trim()) ||
    (draft.collectionTitle && draft.collectionTitle.trim())
  );
  return hasItems || hasFields;
}
