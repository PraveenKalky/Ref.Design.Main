import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import UITasteInput from './UITasteInput';
import UITasteCard from './UITasteCard';
import UITasteHero from './UITasteHero';
import UITasteFilterBar from './UITasteFilterBar';
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
  const hasNotifiedConnectedRef = useRef(false);

  // Discovery Filter State (Category, Type, Tag matching approved layout)
  const [activePlatform, setActivePlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

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
      if (!hasNotifiedConnectedRef.current) {
        hasNotifiedConnectedRef.current = true;
        addToast('Extension Helper active', 'success');
      }
    };

    const handleDisconnected = () => {
      setIsExtensionConnected(false);
      if (hasNotifiedConnectedRef.current) {
        hasNotifiedConnectedRef.current = false;
        addToast('Extension Helper disconnected', 'error');
      }
    };

    window.addEventListener("REF_DESIGN_EXT_CONNECTED", handleConnected);
    window.addEventListener("REF_DESIGN_EXT_DISCONNECTED", handleDisconnected);
    
    // Synced immediate detection check
    if (document.documentElement.dataset.refDesignExtension === "connected") {
      setIsExtensionConnected(true);
      if (!hasNotifiedConnectedRef.current) {
        hasNotifiedConnectedRef.current = true;
        addToast('Extension Helper active', 'success');
      }
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
      window.removeEventListener("REF_DESIGN_EXT_DISCONNECTED", handleDisconnected);
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

  // Client-side multi-tier filter & sort calculation
  const filteredPosts = React.useMemo(() => {
    let list = [...posts];

    // 1. Source Platform Tab Filter
    if (activePlatform === 'saved') {
      list = list.filter(p => savedItems && savedItems[p.id]);
    } else if (activePlatform === 'upload') {
      list = list.filter(p => p.url && p.url.includes('/manual-upload/'));
    } else if (activePlatform !== 'all') {
      list = list.filter(p => (p.platform || '').toLowerCase() === activePlatform.toLowerCase());
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(p => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Media Type Filter
    if (selectedType === 'video') {
      list = list.filter(p => Boolean(p.is_video));
    } else if (selectedType === 'image') {
      list = list.filter(p => !p.is_video);
    }

    // 4. Tag Filter
    if (selectedTag) {
      const tagLower = selectedTag.toLowerCase();
      list = list.filter(p => {
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return desc.includes(tagLower) || cat.includes(tagLower);
      });
    }

    // 5. Keyword Search (Designer / Username / Description / Category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const username = (p.username || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const platform = (p.platform || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return username.includes(q) || desc.includes(q) || platform.includes(q) || cat.includes(q);
      });
    }

    // 6. Sort
    list.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return list;
  }, [posts, activePlatform, selectedCategory, selectedType, selectedTag, searchQuery, sortBy, savedItems]);

  const handleResetFilters = () => {
    setActivePlatform('all');
    setSelectedCategory('All');
    setSelectedType('all');
    setSelectedTag(null);
    setSearchQuery('');
    setSortBy('newest');
  };

  const savedCount = React.useMemo(() => {
    if (!savedItems) return 0;
    return Object.values(savedItems).filter(Boolean).length;
  }, [savedItems]);

  return (
    <div className="ui-tastes-page">
      {/* 3D Curved Perspective Ribbon Hero - Inspired by Melius Reference */}
      <UITasteHero posts={posts}>
        <UITasteInput 
          onAddPost={handleAddPost} 
          isFetching={isFetching}
          onUploadSuccess={(item) => {
            addToast(`Screenshot inspiration added to ${item?.category || 'feed'}!`, 'success');
            fetchPosts();
          }}
        />
      </UITasteHero>

      <div className="ui-tastes-container">
        {/* Discovery Filter Bar (Exact Approved Layout + Fonts Style without Outlines) */}
        <UITasteFilterBar
          activePlatform={activePlatform}
          setActivePlatform={setActivePlatform}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filteredCount={filteredPosts.length}
          savedCount={savedCount}
          onResetFilters={handleResetFilters}
        />

        {filteredPosts.length === 0 ? (
          <div className="ui-tastes-empty-state">
            <p className="ui-tastes-empty-title">No inspirations match your filters</p>
            <p className="ui-tastes-empty-subtitle">
              Try selecting a different platform tab, clearing the search query, or resetting filters.
            </p>
            <button 
              type="button" 
              className="ui-tastes-empty-reset-btn"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="ui-tastes-grid">
            {filteredPosts.map(post => (
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
        )}

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
