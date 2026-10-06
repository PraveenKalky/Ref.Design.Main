import React from 'react';
import { Bookmark, Play } from 'lucide-react';

export default function UITasteCard({ post, isSaved, toggleSave, isResolving }) {
  const [imageError, setImageError] = React.useState(false);
  const [localMediaUrl, setLocalMediaUrl] = React.useState(post.media_url);
  const [isReResolving, setIsReResolving] = React.useState(false);

  const isEphemeralInstagram = post.media_url && post.media_url.includes('cdninstagram.com');

  React.useEffect(() => {
    setLocalMediaUrl(post.media_url);
  }, [post.media_url]);

  React.useEffect(() => {
    if (isEphemeralInstagram) {
      let isMounted = true;
      const resolveUrl = async () => {
        setIsReResolving(true);
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ciquazqdnbwsxuomdmci.supabase.co';
          const res = await fetch(`${supabaseUrl}/functions/v1/telegram-bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reprocess', id: post.id, url: post.url })
          });
          const json = await res.json();
          if (isMounted && json.status === 'success' && json.data.mediaUrl) {
            setLocalMediaUrl(json.data.mediaUrl);
            setImageError(false);
          }
        } catch (e) {
          console.error("Failed to re-resolve media", e);
        } finally {
          if (isMounted) setIsReResolving(false);
        }
      };
      resolveUrl();
      return () => { isMounted = false; };
    }
  }, [isEphemeralInstagram, post.id, post.url]);

  const getDisplayImageUrl = (url) => {
    if (!url) return url;
    if (url.startsWith('/') || url.startsWith('data:')) return url;
    if (url.includes('?proxy=')) return url;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ciquazqdnbwsxuomdmci.supabase.co';
    return `${supabaseUrl}/functions/v1/telegram-bot?proxy=${encodeURIComponent(url)}`;
  };

  if (isResolving || isReResolving) {
    return (
      <div className="taste-card taste-card-skeleton">
        <div className="taste-card-media-wrapper skeleton-media" style={{ height: '220px', background: 'var(--input-bg, #f5f5f5)' }}>
          <div className="skeleton-pulse" style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite' }}></div>
        </div>
        <div className="taste-card-meta" style={{ gap: '8px' }}>
          <div className="taste-card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ width: '80px', height: '14px', background: '#e0e0e0', borderRadius: '4px' }}></div>
            <div style={{ width: '40px', height: '14px', background: '#e0e0e0', borderRadius: '4px' }}></div>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#e5e5e5', borderRadius: '3px' }}></div>
        </div>
      </div>
    );
  }

  const isScreenshot = localMediaUrl && localMediaUrl.includes('thum.io');

  const handleCardClick = () => {
    if (post.url && !post.url.includes('/manual-upload/')) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    } else if (localMediaUrl) {
      // If it's a manual screenshot without external link, open the full-res image
      window.open(getDisplayImageUrl(localMediaUrl), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="taste-card">
      <div 
        className={`taste-card-media-wrapper ${isScreenshot ? 'screenshot-mode' : ''}`}
        onClick={handleCardClick}
      >
        {!localMediaUrl || imageError ? (
          <div className="taste-card-fallback-media">
            <span>{post.platform ? post.platform[0] : '?'}</span>
            <small>
              {post.fetch_error
                ? `Thumbnail unavailable: ${post.fetch_error.split('|')[0].trim()}`
                : (!localMediaUrl ? 'Thumbnail unavailable' : 'Media failed to load')}
            </small>
          </div>
        ) : (
          <img 
            src={getDisplayImageUrl(localMediaUrl)} 
            alt={post.description || post.username} 
            className="taste-card-image" 
            onError={() => setImageError(true)}
          />
        )}

        
        {post.is_video && (
          <div className="taste-card-video-indicator">
            <Play fill="white" size={20} />
          </div>
        )}

        <div className="taste-card-overlay">
          <div className="card-actions">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if(toggleSave) toggleSave(post.id); 
              }}
              className={`card-action-btn card-action-save ${isSaved ? 'saved' : ''}`}
            >
              <Bookmark 
                strokeWidth={2} 
                size={18} 
                className={isSaved ? 'save-icon-filled' : ''} 
              /> 
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="taste-card-meta">
        <div className="taste-card-header">
          <span className="taste-card-username">
            {post.username ? (post.username.startsWith('@') ? post.username : `@${post.username}`) : '@inspiration'}
          </span>
          <span className="taste-card-platform">{post.platform || 'Inspiration'}</span>
        </div>
        {post.description && (
          <p className="taste-card-description">{post.description}</p>
        )}
      </div>
    </div>
  );
}
