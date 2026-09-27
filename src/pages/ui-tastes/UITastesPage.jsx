import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import UITasteInput from './UITasteInput';
import UITasteCard from './UITasteCard';
import '../../components/card-grid/card-grid.css'; // For reusing card hover states
import './ui-tastes.css';
import '../../components/navbar/login-modal.css'; // Reuse existing toast styles
import { supabase } from '../../lib/supabase';

export default function UITastesPage({ savedItems, toggleSave }) {
  const [posts, setPosts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [resolvingIds, setResolvingIds] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const handleConnected = () => {
      setIsExtensionConnected(true);
    };

    window.addEventListener("REF_DESIGN_EXT_CONNECTED", handleConnected);
    
    // Synced immediate detection check
    if (document.documentElement.dataset.refDesignExtension === "connected") {
      setIsExtensionConnected(true);
    }

    // Initial fetch
    fetchPosts();

    // Subscribe to real-time changes so the page updates immediately when the Telegram bot inserts a row
    const subscription = supabase
      .channel('ui_tastes_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ui_tastes' }, (payload) => {
        setPosts((currentPosts) => [payload.new, ...currentPosts]);
        migratePlaceholders([payload.new]);
      })
      .subscribe();

    return () => {
      window.removeEventListener("REF_DESIGN_EXT_CONNECTED", handleConnected);
      supabase.removeChannel(subscription);
    };
  }, []);

  const scrapeWithExtension = (url, id = null) => {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substring(2, 15);
      
      const handleResponse = (event) => {
        if (event.detail.requestId === requestId) {
          window.removeEventListener("REF_DESIGN_SCRAPE_RESPONSE", handleResponse);
          if (event.detail.success) {
            resolve(event.detail.data);
          } else {
            reject(new Error(event.detail.error));
          }
        }
      };
      
      window.addEventListener("REF_DESIGN_SCRAPE_RESPONSE", handleResponse);
      
      // Dispatch scrape request custom event
      window.dispatchEvent(new CustomEvent("REF_DESIGN_SCRAPE_REQUEST", {
        detail: { url, id, requestId }
      }));

      // 15 seconds request timeout
      setTimeout(() => {
        window.removeEventListener("REF_DESIGN_SCRAPE_RESPONSE", handleResponse);
        reject(new Error("Helper Extension scraper request timed out."));
      }, 15000);
    });
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('ui_tastes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
      // Trigger migration for existing placeholders in the background
      if (data) {
        migratePlaceholders(data);
      }
    }
  };

  // Helper to migrate existing placeholders
  const migratePlaceholders = async (currentPosts) => {
    const placeholderUrl = 'photo-1618761714954-0b8cd0026356';
    const postsToMigrate = currentPosts.filter(p => 
      !p.media_url || 
      p.media_url.includes(placeholderUrl) ||
      (p.platform === 'Dribbble' && p.media_url.includes('thum.io'))
    );
    
    if (postsToMigrate.length === 0) return;

    // Mark all as resolving immediately
    setResolvingIds(prev => {
      const next = new Set(prev);
      postsToMigrate.forEach(post => next.add(post.id));
      return next;
    });

    for (const post of postsToMigrate) {
      try {
        console.log(`Migrating placeholder for post: ${post.url}`);
        
        let meta;
        if (isExtensionConnected) {
          console.log(`[migrate] Resolving client-side via extension helper for: ${post.url}`);
          meta = await scrapeWithExtension(post.url, post.id);
          
          // Send scraped metadata to Edge Function to bypass client-side RLS limits
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('telegram-bot', {
            body: { url: post.url, id: post.id, metadata: meta }
          });
          
          if (edgeError) throw edgeError;
        } else {
          // Fall back to serverless function
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('telegram-bot', {
            body: { url: post.url, id: post.id }
          });
          if (edgeError) throw edgeError;
          meta = edgeData?.data;
        }

        if (meta && meta.mediaUrl) {
          const mediaUrl = meta.mediaUrl;
          const isVideo = !!meta.isVideo;
          const description = meta.description || post.description;
          const username = meta.title || post.username;

          // Update React state directly
          setPosts(prev => prev.map(p => p.id === post.id ? { ...p, media_url: mediaUrl, is_video: isVideo, description, username } : p));
        }
      } catch (err) {
        console.error('Failed to migrate post:', post.id, err);
      } finally {
        // Remove from resolving
        setResolvingIds(prev => {
          const next = new Set(prev);
          next.delete(post.id);
          return next;
        });
      }
    }
  };

  const handleAddPost = async (url, category) => {
    setIsFetching(true);
    
    try {
      console.log(`[handleAddPost] Processing URL: ${url}`);
      
      let meta;
      if (isExtensionConnected) {
        console.log('[handleAddPost] Extension detected! Scraping metadata client-side...');
        meta = await scrapeWithExtension(url);
        
        // Delegate database insert to Edge Function to bypass client RLS limits
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('telegram-bot', {
          body: { url, insert: true, category, metadata: meta }
        });
        
        if (edgeError) {
          throw new Error(`Edge Function error: ${edgeError.message}`);
        } else if (edgeData?.status === 'error') {
          throw new Error(`Insert failed: ${edgeData.message}`);
        } else if (edgeData?.status === 'success') {
          addToast('Post added successfully!', 'success');
          fetchPosts();
        }
      } else {
        // Fall back to serverless function (cloud scraper)
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('telegram-bot', {
          body: { url, insert: true, category }
        });

        if (edgeError) {
          throw new Error(`Edge Function error: ${edgeError.message}`);
        } else if (edgeData?.status === 'error') {
          throw new Error(`Scraper failed: ${edgeData.message}`);
        } else if (edgeData?.status === 'success') {
          addToast('Post added successfully!', 'success');
          fetchPosts();
        } else {
          throw new Error('Unexpected response format from serverless worker.');
        }
      }
    } catch (err) {
      console.error('[handleAddPost] Error:', err);
      addToast(err.message || 'Failed to parse page metadata. Please try again.', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="ui-tastes-page">
      <div className="ui-tastes-container">
        
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', background: 'var(--input-bg, #f5f5f5)', padding: '0.5rem 1.1rem', borderRadius: '20px', border: '1px solid var(--border-color, #e5e5e5)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isExtensionConnected ? '#22c55e' : '#eab308', boxShadow: isExtensionConnected ? '0 0 8px #22c55e' : 'none' }}></span>
            <span style={{ color: 'var(--text-color, #111111)', fontWeight: '500' }}>
              Extension Helper: {isExtensionConnected ? 'Active (WAF Bypassed)' : 'Offline (Cloud Scraper Fallback)'}
            </span>
          </div>
        </div>

        <UITasteInput onAddPost={handleAddPost} isFetching={isFetching} />

        {/* Future Architecture Placeholder for Filters/Sorting */}
        {/* <FilterBar /> */}

        <div className="ui-tastes-grid">
          {posts.map(post => (
            <div key={post.id} className="ui-tastes-grid-item">
              <UITasteCard 
                post={post} 
                isSaved={savedItems ? savedItems[post.id] : false}
                toggleSave={toggleSave}
                isResolving={resolvingIds.has(post.id)}
              />
            </div>
          ))}
        </div>

      </div>
      
      {/* Toast Notification Container */}
      <div className="lm-toast-container">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              className="lm-toast"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: 'backOut' }}
            >
              <div className={`lm-toast-icon lm-toast-${toast.type}`}>
                {toast.type === 'success' ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
              </div>
              <span className="lm-toast-msg">{toast.message}</span>
              <button className="lm-toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
