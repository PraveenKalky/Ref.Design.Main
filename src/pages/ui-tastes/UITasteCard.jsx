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
  Check,
  Heart,
  MessageCircle,
  Globe 
} from 'lucide-react';
import { isVideoMedia, getDisplayImageUrl, getProxiedUrl } from '../../utils/mediaUtils';
import { 
  parseSocialPost, 
  formatStatCount,
  getCleanTasteTitle, 
  getDisplayPlatform, 
  updateTasteInDB, 
  deleteTasteFromDB 
} from '../../utils/tasteActions';
import { PlatformIcon } from '../../utils/platformIcons';
import { UI_TASTES_CATEGORIES } from './UITasteFilterBar';
import { useAuth } from '../../context/AuthContext';
import Modal, { ConfirmationModal } from '../../components/modal/Modal';


export default function UITasteCard({ 
  post, 
  isSaved, 
  toggleSave, 
  isResolving,
  onUpdatePost,
  onDeletePost,
  onToast,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect
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
  }, [post.id, post.avatar_url, post.media_url, post.category, post.description]);

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

  const handleCardClick = (e) => {
    if (isSelectMode) {
      if (e) e.stopPropagation();
      if (onToggleSelect) onToggleSelect(post.id);
      return;
    }
    if (post.url && !post.url.includes('/manual-upload/')) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    } else if (localMediaUrl) {
      window.open(imgSrc || localMediaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`taste-card ${isSelectMode ? 'is-select-mode' : ''} ${isSelected ? 'is-selected' : ''}`}
      onClick={isSelectMode ? handleCardClick : undefined}
    >
      <div 
        className={`taste-card-media-wrapper ${isScreenshot ? 'screenshot-mode' : ''}`}
        onClick={handleCardClick}
      >
        {/* Multi-Select Checkbox Overlay */}
        {isSelectMode && (
          <div 
            className={`taste-card-select-checkbox ${isSelected ? 'is-checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSelect) onToggleSelect(post.id);
            }}
            role="checkbox"
            aria-checked={isSelected}
            aria-label={isSelected ? `Deselect ${displayName}` : `Select ${displayName}`}
          >
            {isSelected ? (
              <Check size={13} strokeWidth={3} className="taste-card-check-icon" />
            ) : null}
          </div>
        )}

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

        {/* Hover Overlay with Save Button (Hidden during select mode) */}
        {!isSelectMode && (
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
        )}

        {/* Subtle ••• Action Menu Button (Hidden during select mode) */}
        {!isSelectMode && (
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
        )}
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
                referrerPolicy="no-referrer"
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
              <PlatformIcon platform={displayPlatform} url={post.url} size={14} />
            </span>
            {handle && handle.replace(/^@/, '').toLowerCase() !== displayName.toLowerCase() && (
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
                <span className="taste-card-stat" title={`${likes.toLocaleString()} likes`}>
                  <Heart size={13} strokeWidth={2} className="taste-stat-icon" />
                  <span>{formatStatCount(likes)}</span>
                </span>
              )}
              {comments !== null && comments !== undefined && (
                <span className="taste-card-stat" title={`${comments.toLocaleString()} comments`}>
                  <MessageCircle size={13} strokeWidth={2} className="taste-stat-icon" />
                  <span>{formatStatCount(comments)}</span>
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

      {/* Rename Modal */}
      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="Rename Inspiration"
        size="md"
      >
        <form onSubmit={handleSaveRename}>
          <div className="admin-modal-field">
            <input 
              type="text" 
              className="admin-modal-input"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              placeholder="Enter title..."
              autoFocus
              required
            />
          </div>
          <div className="admin-modal-actions">
            <button 
              type="button" 
              className="admin-modal-btn admin-modal-btn-cancel" 
              onClick={() => setShowRenameModal(false)} 
              disabled={isSubmitting}
            >
              Cancel <kbd className="admin-modal-kbd">Esc</kbd>
            </button>
            <button 
              type="submit" 
              className="admin-modal-btn admin-modal-btn-primary" 
              disabled={isSubmitting || !renameInput.trim()}
            >
              {isSubmitting ? 'Saving…' : <>Save <kbd className="admin-modal-kbd">↵</kbd></>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Inspiration"
        description={<>Are you sure you want to delete <strong>"{displayTitle}"</strong>? This action cannot be undone and will permanently remove this post and its media.</>}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        isLoading={isSubmitting}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Inspiration"
        size="lg"
      >
        <form onSubmit={handleSaveEdit}>
          <div className="admin-modal-field">
            <label className="admin-modal-label" htmlFor={`edit-title-${post.id}`}>Title / Creator</label>
            <input 
              id={`edit-title-${post.id}`}
              type="text" 
              className="admin-modal-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Inspiration title or creator name..."
              required
              autoFocus
            />
          </div>

          <div className="admin-modal-field">
            <label className="admin-modal-label" htmlFor={`edit-category-${post.id}`}>Category</label>
            <select 
              id={`edit-category-${post.id}`}
              className="admin-modal-select"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              {UI_TASTES_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="admin-modal-field">
            <label className="admin-modal-label" htmlFor={`edit-desc-${post.id}`}>Description & Tags</label>
            <textarea 
              id={`edit-desc-${post.id}`}
              className="admin-modal-textarea"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add tags or description notes..."
              rows={3}
            />
          </div>

          <div className="admin-modal-actions">
            <button 
              type="button" 
              className="admin-modal-btn admin-modal-btn-cancel" 
              onClick={() => setShowEditModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-modal-btn admin-modal-btn-primary"
              disabled={isSubmitting || !editTitle.trim()}
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
