import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, ExternalLink, Trash2, Edit2, X, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { isVideoMedia, getDisplayImageUrl } from '../../utils/mediaUtils';
import { getCleanTasteTitle, getDisplayPlatform, deleteTasteFromDB } from '../../utils/tasteActions';
import './UITasteDetailModal.css';

export default function UITasteDetailModal({
  post,
  isOpen,
  onClose,
  isSaved,
  toggleSave,
  onEdit,
  onDeletePost,
  onToast,
  isAuthorized
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('has-modal-open');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('has-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showDeleteConfirm, onClose]);

  if (!isOpen || !post) return null;

  const title = getCleanTasteTitle(post);
  const platform = getDisplayPlatform(post.platform, post.url);
  const mediaUrl = post.media_url;
  const isVideo = Boolean(post.is_video || isVideoMedia(mediaUrl));
  const displayImage = getDisplayImageUrl(mediaUrl);

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  const handleOpenSource = () => {
    if (post.url && !post.url.includes('/manual-upload/')) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    } else if (mediaUrl) {
      window.open(mediaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const { error } = await deleteTasteFromDB(post);
    if (error) {
      if (onToast) onToast('Failed to delete post: ' + (error.message || 'error'), 'error');
      setIsDeleting(false);
    } else {
      if (onDeletePost) onDeletePost(post.id);
      if (onToast) onToast('Inspiration deleted successfully');
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return createPortal(
    <div className="taste-detail-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="taste-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button Top Right */}
        <button
          type="button"
          className="taste-detail-close-btn"
          onClick={onClose}
          aria-label="Close details"
        >
          <X size={18} />
        </button>

        <div className="taste-detail-content">
          {/* Media Container */}
          <div className="taste-detail-media-wrap">
            {isVideo ? (
              <video
                src={mediaUrl}
                poster={post.thumbnail_url || undefined}
                className="taste-detail-media"
                controls
                autoPlay
                playsInline
                loop
              />
            ) : (
              <img
                src={displayImage || mediaUrl}
                alt={title}
                className="taste-detail-media"
              />
            )}
          </div>

          {/* Details Sidebar / Panel */}
          <div className="taste-detail-info">
            <div className="taste-detail-header">
              <div className="taste-detail-badges">
                <span className="taste-detail-platform-badge">{platform}</span>
                {post.category && post.category !== 'Uncategorized' && (
                  <span className="taste-detail-category-badge">
                    <Tag size={12} />
                    {post.category}
                  </span>
                )}
              </div>
              <h2 className="taste-detail-title">{title}</h2>
            </div>

            {/* Description / Caption */}
            {post.description && (
              <div className="taste-detail-desc-box">
                <h4 className="taste-detail-section-label">Description & Captions</h4>
                <p className="taste-detail-desc-text">{post.description}</p>
              </div>
            )}

            {/* Metadata info */}
            <div className="taste-detail-meta-list">
              {formattedDate && (
                <div className="taste-detail-meta-item">
                  <Calendar size={14} className="taste-detail-meta-icon" />
                  <span>Imported on {formattedDate}</span>
                </div>
              )}
              {isAuthorized && (
                <div className="taste-detail-meta-item authorized">
                  <ShieldCheck size={14} className="taste-detail-meta-icon" />
                  <span>Admin access active</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="taste-detail-actions">
              {post.url && (
                <button
                  type="button"
                  className="taste-detail-btn taste-detail-btn-primary"
                  onClick={handleOpenSource}
                >
                  <span>Visit {platform}</span>
                  <ExternalLink size={14} />
                </button>
              )}

              <button
                type="button"
                className={`taste-detail-btn taste-detail-btn-save ${isSaved ? 'is-saved' : ''}`}
                onClick={() => toggleSave && toggleSave(post.id)}
              >
                <Bookmark size={15} className={isSaved ? 'save-icon-filled' : ''} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {isAuthorized && (
                <>
                  <button
                    type="button"
                    className="taste-detail-btn taste-detail-btn-edit"
                    onClick={() => {
                      onClose();
                      if (onEdit) onEdit();
                    }}
                    title="Edit inspiration"
                  >
                    <Edit2 size={15} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="taste-detail-btn taste-detail-btn-delete"
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Delete inspiration"
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Sub-Modal */}
      {showDeleteConfirm && (
        <div
          className="taste-delete-confirm-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
        >
          <div className="taste-delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="taste-delete-confirm-header">
              <h3>Delete inspiration?</h3>
              <button
                type="button"
                className="taste-delete-confirm-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="taste-delete-confirm-body">
              <p>
                Are you sure you want to permanently delete <strong>"{title}"</strong>? This action cannot be undone and will remove associated media safely.
              </p>
            </div>
            <div className="taste-delete-confirm-footer">
              <button
                type="button"
                className="taste-delete-btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="taste-delete-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
