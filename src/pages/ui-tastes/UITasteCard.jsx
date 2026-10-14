import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bookmark, 
  Play, 
  MoreVertical, 
  Edit, 
  Pencil, 
  Trash2, 
  X,
  Heart,
  MessageCircle,
  Globe 
} from 'lucide-react';
import { isVideoMedia, getDisplayImageUrl, getProxiedUrl } from '../../utils/mediaUtils';
import { 
  parseSocialPost, 
  getCleanTasteTitle, 
  getDisplayPlatform, 
  updateTasteInDB, 
  deleteTasteFromDB 
} from '../../utils/tasteActions';
import { UI_TASTES_CATEGORIES } from './UITasteFilterBar';
import { useAuth } from '../../context/AuthContext';

function renderPlatformIcon(platform, size = 13) {
  const p = (platform || '').toLowerCase();
  if (p === 'instagram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (p === 'x' || p === 'twitter') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (p === 'dribbble') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.952-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.017-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.438c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.176zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.477 0-.945.04-1.4.113v.175zm4.815 7.38c.21-.06.42-.12.63-.174-1.74-3.105-3.62-5.696-3.886-6.067-1.897.386-3.58 1.31-4.9 2.612C7.586 6.29 9.383 8.72 10.82 10.785c1.19-.398 2.46-.74 3.596-.953z"/>
      </svg>
    );
  }
  if (p === 'behance') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-.16 1.35-.49.35-1.05.6-1.69.75-.63.148-1.29.225-1.98.225H0V4.51h6.938v-.007zM6.955 9.66c.59 0 1.08-.14 1.447-.42.37-.28.55-.72.55-1.33 0-.33-.057-.61-.174-.84-.116-.23-.28-.42-.49-.57-.21-.14-.45-.24-.724-.3-.27-.06-.57-.09-.89-.09H3.62V9.66h3.336v.002zm.16 5.49c.35 0 .67-.03.97-.1.3-.07.56-.18.79-.34.23-.16.41-.37.54-.63.13-.27.2-.59.2-.97 0-.76-.22-1.31-.67-1.66-.45-.34-1.05-.51-1.81-.51H3.62v4.21h3.495zm8.16-5.19c.5-.48 1.19-.72 2.07-.72.6 0 1.12.14 1.54.42.42.28.76.6 1 .98.24.38.41.79.49 1.24.08.45.12.87.12 1.28v.75H13.5c.05.8.27 1.35.67 1.67.4.32.9.48 1.52.48.48 0 .9-.1 1.26-.31.36-.21.6-.43.72-.66h2.71c-.43 1.08-1.09 1.85-1.97 2.3-.88.45-1.94.67-3.18.67-.87 0-1.64-.13-2.34-.4-.7-.27-1.3-.65-1.79-1.15-.5-.5-.88-1.1-1.16-1.8-.28-.7-.42-1.47-.42-2.3 0-.82.14-1.59.43-2.3.29-.71.69-1.32 1.2-1.83.51-.51 1.11-.9 1.82-1.18.71-.28 1.49-.42 2.33-.42.96 0 1.8.18 2.5.55.7.37 1.27.86 1.72 1.47.45.61.77 1.3.97 2.08.2.78.27 1.59.21 2.44h-7.84c0-.81.22-1.44.65-1.9zM17.06 8.6c-.38-.41-.93-.62-1.65-.62-.48 0-.88.08-1.19.24-.31.16-.56.36-.74.6-.18.24-.31.49-.38.76-.07.27-.11.52-.12.74h4.82c-.06-.77-.35-1.35-.74-1.72zM14.92 4.5h5.41v1.38h-5.41V4.5z"/>
      </svg>
    );
  }
  if (p === 'pinterest') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    );
  }
  return <Globe size={size} />;
}

export default function UITasteCard({ 
  post, 
  isSaved, 
  toggleSave, 
  isResolving,
  onUpdatePost,
  onDeletePost,
  onToast 
}) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [localMediaUrl, setLocalMediaUrl] = useState(post.media_url);
  const [imgSrc, setImgSrc] = useState(() => getDisplayImageUrl(post.media_url));
  const [triedFallback, setTriedFallback] = useState(false);
  const [isReResolving, setIsReResolving] = useState(false);

  // Card Management States
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState(post.category || 'Uncategorized');
  const [editDescription, setEditDescription] = useState(post.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuRef = useRef(null);

  // Authentication check
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (e) {
    user = null;
  }

  const isAuthorized = Boolean(user) || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

  // Social Metadata Extraction for Layout 1
  const {
    avatarUrl,
    displayName,
    handle,
    shortDesc,
    likes,
    comments,
    formattedDate,
    displayPlatform
  } = parseSocialPost(post);

  const displayTitle = getCleanTasteTitle(post);

  const isEphemeralInstagram = post.media_url && post.media_url.includes('cdninstagram.com');

  useEffect(() => {
    setLocalMediaUrl(post.media_url);
    setImgSrc(getDisplayImageUrl(post.media_url));
    setImageError(false);
    setVideoError(false);
    setAvatarError(false);
    setTriedFallback(false);
    setEditCategory(post.category || 'Uncategorized');
    setEditDescription(post.description || '');
  }, [post.media_url, post.category, post.description]);

  useEffect(() => {
    if (localMediaUrl) {
      setImgSrc(getDisplayImageUrl(localMediaUrl));
    }
  }, [localMediaUrl]);

  // Click outside to close 3-dot dropdown menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Lock background scroll while any modal is open
  useEffect(() => {
    if (showRenameModal || showDeleteModal || showEditModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('has-modal-open');

      const handleGlobalKeyDown = (e) => {
        if (e.key === 'Escape') {
          setShowRenameModal(false);
          setShowDeleteModal(false);
          setShowEditModal(false);
        }
      };
      window.addEventListener('keydown', handleGlobalKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.classList.remove('has-modal-open');
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [showRenameModal, showDeleteModal, showEditModal]);

  useEffect(() => {
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
            setImgSrc(getDisplayImageUrl(json.data.mediaUrl));
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

  const handleImageError = () => {
    if (!triedFallback && localMediaUrl) {
      setTriedFallback(true);
      if (typeof imgSrc === 'string' && imgSrc.includes('?proxy=')) {
        setImgSrc(localMediaUrl);
        return;
      }
      const proxied = getProxiedUrl(localMediaUrl);
      if (proxied !== imgSrc) {
        setImgSrc(proxied);
        return;
      }
    }
    setImageError(true);
  };

  // Card Management Handlers
  const handleOpenEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (!isAuthorized) {
      if (onToast) onToast('Please sign in to manage inspirations', 'error');
      return;
    }
    setEditTitle(displayTitle);
    setEditCategory(post.category || 'Uncategorized');
    setEditDescription(post.description || '');
    setShowEditModal(true);
  };

  const handleOpenRename = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (!isAuthorized) {
      if (onToast) onToast('Please sign in to manage inspirations', 'error');
      return;
    }
    setRenameInput(displayTitle);
    setShowRenameModal(true);
  };

  const handleOpenDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (!isAuthorized) {
      if (onToast) onToast('Please sign in to manage inspirations', 'error');
      return;
    }
    setShowDeleteModal(true);
  };

  const handleSaveRename = async (e) => {
    e?.preventDefault();
    if (!renameInput.trim()) return;
    setIsSubmitting(true);

    const updatedTitle = renameInput.trim();
    const { error } = await updateTasteInDB(post, { title: updatedTitle });

    if (error) {
      if (onToast) onToast('Failed to rename post', 'error');
    } else {
      if (onUpdatePost) {
        onUpdatePost(post.id, { username: updatedTitle, title: updatedTitle });
      }
      if (onToast) onToast('Inspiration renamed');
      setShowRenameModal(false);
    }
    setIsSubmitting(false);
  };

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!editTitle.trim()) return;
    setIsSubmitting(true);

    const updates = {
      title: editTitle.trim(),
      category: editCategory,
      description: editDescription.trim()
    };

    const { error } = await updateTasteInDB(post, updates);

    if (error) {
      if (onToast) onToast('Failed to update post', 'error');
    } else {
      if (onUpdatePost) {
        onUpdatePost(post.id, {
          username: updates.title,
          title: updates.title,
          category: updates.category,
          description: updates.description
        });
      }
      if (onToast) onToast('Inspiration updated');
      setShowEditModal(false);
    }
    setIsSubmitting(false);
  };

  const handleConfirmDelete = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    const { error } = await deleteTasteFromDB(post);

    if (error) {
      if (onToast) onToast('Failed to delete post: ' + (error.message || 'database error'), 'error');
      setIsSubmitting(false);
    } else {
      if (onDeletePost) {
        onDeletePost(post.id);
      }
      if (onToast) onToast('Inspiration deleted');
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  if (isResolving || isReResolving) {
    return (
      <div className="taste-card taste-card-skeleton">
        <div className="taste-card-media-wrapper skeleton-media" style={{ height: '220px', background: 'var(--input-bg, #f5f5f5)' }}>
          <div className="skeleton-pulse" style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite' }}></div>
        </div>
        <div className="taste-card-meta" style={{ gap: '8px' }}>
          <div className="taste-card-author-row">
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e0e0e0' }}></div>
            <div style={{ width: '100px', height: '14px', background: '#e0e0e0', borderRadius: '4px' }}></div>
            <div style={{ width: '50px', height: '14px', background: '#e0e0e0', borderRadius: '4px', marginLeft: 'auto' }}></div>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#e5e5e5', borderRadius: '3px' }}></div>
        </div>
      </div>
    );
  }

  // Detect login wall screenshots or invalid screenshot fallbacks
  const isInstagramLoginScreenshot = (
    (post.platform === 'Instagram' || (post.url && post.url.includes('instagram.com'))) &&
    (
      (localMediaUrl && localMediaUrl.includes('thum.io')) ||
      (localMediaUrl && localMediaUrl.includes('1791999378260_jrc69i.png')) ||
      post.username === 'Instagram'
    ) &&
    !post.is_video
  );

  const isScreenshot = localMediaUrl && localMediaUrl.includes('thum.io');
  const isPlayableVideo = isVideoMedia(localMediaUrl) && !videoError;
  const hasValidMedia = localMediaUrl && !imageError && !isInstagramLoginScreenshot;

  const handleCardClick = () => {
    if (post.url && !post.url.includes('/manual-upload/')) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    } else if (localMediaUrl) {
      window.open(imgSrc || localMediaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="taste-card">
      <div 
        className={`taste-card-media-wrapper ${isScreenshot ? 'screenshot-mode' : ''}`}
        onClick={handleCardClick}
      >
        {!hasValidMedia && !isPlayableVideo ? (
          <div className="taste-card-fallback-media">
            <span>{displayPlatform ? displayPlatform[0] : '?'}</span>
            <small>
              {post.fetch_error
                ? `Thumbnail unavailable: ${post.fetch_error.split('|')[0].trim()}`
                : (!localMediaUrl || isInstagramLoginScreenshot ? 'Thumbnail unavailable' : 'Media failed to load')}
            </small>
          </div>
        ) : isPlayableVideo ? (
          <video
            src={localMediaUrl}
            poster={post.thumbnail_url || undefined}
            className="taste-card-image"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
          />
        ) : (
          <img 
            src={imgSrc} 
            alt={displayName} 
            className="taste-card-image" 
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {post.is_video && !isPlayableVideo && (
          <div className="taste-card-video-indicator" aria-label="Video inspiration">
            <Play fill="white" size={20} />
          </div>
        )}

        {/* Hover Overlay with Save Button */}
        <div className="taste-card-overlay">
          <div className="card-actions">
            <button 
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                if (toggleSave) toggleSave(post.id); 
              }}
              className={`card-action-btn card-action-save ${isSaved ? 'saved' : ''}`}
              title={isSaved ? 'Remove from saved' : 'Save inspiration'}
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

        {/* Subtle ••• Action Menu Button */}
        <div className="card-menu-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button 
            type="button" 
            className={`card-menu-btn ${showMenu ? 'active' : ''}`} 
            onClick={() => setShowMenu(prev => !prev)}
            title="Options"
            aria-label="Inspiration options"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="card-dropdown-menu">
              <button type="button" className="card-dropdown-item" onClick={handleOpenEdit}>
                <Edit size={14} className="card-dropdown-icon" />
                <span>Edit</span>
              </button>
              <button type="button" className="card-dropdown-item" onClick={handleOpenRename}>
                <Pencil size={14} className="card-dropdown-icon" />
                <span>Rename</span>
              </button>
              <button type="button" className="card-dropdown-item delete-item" onClick={handleOpenDelete}>
                <Trash2 size={14} className="card-dropdown-icon" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* ── Layout 1: Social Post Card Details ── */}
      <div className="taste-card-meta">
        {/* Row 1: Creator Row (Avatar + Name on left, Platform Icon + Handle on right) */}
        <div className="taste-card-author-row">
          <div className="taste-card-author-left">
            {avatarUrl && !avatarError ? (
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className="taste-card-avatar"
                onError={() => setAvatarError(true)}
                loading="lazy"
              />
            ) : (
              <div className="taste-card-avatar-fallback">
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span className="taste-card-author-name" title={displayName}>
              {displayName}
            </span>
          </div>

          <div className="taste-card-author-right">
            <span className="taste-card-platform-icon" title={displayPlatform}>
              {renderPlatformIcon(displayPlatform)}
            </span>
            {handle && (
              <span className="taste-card-handle" title={handle}>
                {handle}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Short Description (max 2 lines with ellipsis) */}
        {shortDesc && (
          <p className="taste-card-desc" title={shortDesc}>
            {shortDesc}
          </p>
        )}

        {/* Row 3: Footer Row (Engagement counts on left, Date on right) */}
        {(likes !== null || comments !== null || formattedDate) && (
          <div className="taste-card-footer-row">
            <div className="taste-card-engagement">
              {likes !== null && likes !== undefined && (
                <span className="taste-card-stat">
                  <Heart size={13} strokeWidth={2} className="taste-stat-icon" />
                  <span>{likes.toLocaleString()}</span>
                </span>
              )}
              {comments !== null && comments !== undefined && (
                <span className="taste-card-stat">
                  <MessageCircle size={13} strokeWidth={2} className="taste-stat-icon" />
                  <span>{comments.toLocaleString()}</span>
                </span>
              )}
            </div>

            {formattedDate && (
              <span className="taste-card-date">
                {formattedDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Rename Micro-Dialog (Portaled to document.body) */}
      {showRenameModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="rename-micro-overlay" 
          onClick={() => setShowRenameModal(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowRenameModal(false); }}
        >
          <div className="rename-micro-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="rename-micro-header">
              <span className="rename-micro-title">Rename Inspiration</span>
              <button 
                type="button" 
                className="rename-micro-close" 
                onClick={() => setShowRenameModal(false)}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSaveRename}>
              <div className="rename-micro-body">
                <input 
                  type="text" 
                  className="rename-micro-input"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setShowRenameModal(false);
                    }
                  }}
                  placeholder="Enter title..."
                  autoFocus
                  required
                />
              </div>
              <div className="rename-micro-footer">
                <button 
                  type="button" 
                  className="rename-micro-btn rename-micro-cancel" 
                  onClick={() => setShowRenameModal(false)} 
                  disabled={isSubmitting}
                >
                  Cancel <kbd className="rename-micro-kbd">Esc</kbd>
                </button>
                <button 
                  type="submit" 
                  className="rename-micro-btn rename-micro-save" 
                  disabled={isSubmitting || !renameInput.trim()}
                >
                  {isSubmitting ? 'Saving…' : <>Save <kbd className="rename-micro-kbd">↵</kbd></>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal (Portaled to document.body) */}
      {showDeleteModal && typeof document !== 'undefined' && createPortal(
        <div className="section-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="section-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="section-modal-header">
              <h3>Delete inspiration?</h3>
              <button type="button" className="section-modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="section-modal-body">
              <p>This will permanently remove this post and its media from UI/UX Tastes.</p>
            </div>
            <div className="section-modal-footer">
              <button 
                type="button" 
                className="section-modal-btn section-modal-btn-cancel" 
                onClick={() => setShowDeleteModal(false)} 
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="section-modal-btn section-modal-btn-danger" 
                onClick={handleConfirmDelete} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Modal (Portaled to document.body) */}
      {showEditModal && typeof document !== 'undefined' && createPortal(
        <div className="taste-edit-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="taste-edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="taste-edit-modal-header">
              <h3>Edit Inspiration</h3>
              <button 
                type="button" 
                className="taste-edit-modal-close" 
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="taste-edit-modal-body">
                <div className="taste-edit-field">
                  <label htmlFor={`edit-title-${post.id}`}>Title / Creator</label>
                  <input 
                    id={`edit-title-${post.id}`}
                    type="text" 
                    className="taste-edit-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Inspiration title or creator name..."
                    required
                    autoFocus
                  />
                </div>

                <div className="taste-edit-field">
                  <label htmlFor={`edit-category-${post.id}`}>Category</label>
                  <select 
                    id={`edit-category-${post.id}`}
                    className="taste-edit-select"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {UI_TASTES_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="taste-edit-field">
                  <label htmlFor={`edit-desc-${post.id}`}>Description & Tags</label>
                  <textarea 
                    id={`edit-desc-${post.id}`}
                    className="taste-edit-textarea"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add tags or description notes..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="taste-edit-modal-footer">
                <button 
                  type="button" 
                  className="taste-edit-btn taste-edit-btn-cancel" 
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="taste-edit-btn taste-edit-btn-save"
                  disabled={isSubmitting || !editTitle.trim()}
                >
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
