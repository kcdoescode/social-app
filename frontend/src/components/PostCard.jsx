import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as postService from '../services/postService.js';
import { Heart, MessageSquare, Trash2, MoreVertical, Bookmark, AlertTriangle, ArrowUpCircle } from 'react-feather';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-backdrop-confirm">
      <div className="modal-content-confirm">
        <AlertTriangle size={48} color="#d93025" />
        <h4>{message}</h4>
        <p>This action cannot be undone.</p>
        <div className="modal-actions-confirm">
          <button onClick={onCancel} className="button secondary">Cancel</button>
          <button onClick={onConfirm} className="button danger">Delete</button>
        </div>
      </div>
    </div>
  );
};

const UserLink = ({ user, username }) => {
  const userId = user?._id || user?.id;
  const name = username || user?.username || 'Unknown User';
  const avatarUrl = user?.profilePictureUrl;

  const content = (
    <>
      {avatarUrl && <img src={avatarUrl} alt="" className="avatar-small" />}
      <strong>{name}</strong>
    </>
  );

  return userId ? (
    <Link to={`/profile/${userId}`} className="post-author-link">
      {content}
    </Link>
  ) : (
    <span className="post-author-no-link">{content}</span>
  );
};

function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const { user: authUser, token, savedPosts, toggleSavePost, followingList, toggleFollow } = useAuth();

  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(null);

  const currentUserId = authUser ? String(authUser.id || authUser._id) : null;
  const postAuthorId = post.user ? String(post.user._id || post.user.id) : null;

  const isLikedByCurrentUser = authUser && post.likes.includes(currentUserId);
  const isOwnerOfPost = authUser && postAuthorId && (postAuthorId === currentUserId);
  const isSaved = authUser && savedPosts.includes(String(post._id));
  const isFollowingAuthor = authUser && postAuthorId && followingList.includes(postAuthorId);

  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  const handleLike = async () => {
    if (!token) return;
    try {
      const updatedPost = await postService.likePost(post._id, token);
      onPostUpdated(updatedPost);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    toggleSavePost(post._id);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText || !token) return;
    setIsCommenting(true);
    setError('');
    try {
      const updatedPost = await postService.commentOnPost(post._id, commentText, token);
      onPostUpdated(updatedPost);
      setCommentText('');
      setShowComments(true);
    } catch (err) {
      setError('Failed to post comment.');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePostClick = () => {
    setIsMenuOpen(false);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    setShowDeleteModal(false);
    try {
      await postService.deletePost(post._id, token);
      onPostDeleted(post._id);
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('Failed to delete post.');
    }
  };

  const handleDeleteCommentClick = (commentId) => {
    setShowDeleteCommentModal(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!showDeleteCommentModal) return;
    const commentId = showDeleteCommentModal;
    setShowDeleteCommentModal(null);
    try {
      const updatedPost = await postService.deleteComment(post._id, commentId, token);
      onPostUpdated(updatedPost);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isValidImageUrl = post.imageUrl && (post.imageUrl.startsWith('http') || post.imageUrl.startsWith('https'));

  const handleFollowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (postAuthorId) {
      toggleFollow(postAuthorId);
    }
  };

  return (
    <>
      {showDeleteModal && (
        <ConfirmModal
          message="Are you sure you want to delete this post?"
          onConfirm={confirmDeletePost}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {showDeleteCommentModal && (
        <ConfirmModal
          message="Are you sure you want to delete this comment?"
          onConfirm={confirmDeleteComment}
          onCancel={() => setShowDeleteCommentModal(null)}
        />
      )}

      <div className="card post-card">
        <div className="post-header">
          <div className="post-author-details">
            <UserLink user={post.user} />
            {!isOwnerOfPost && (
              <>
                <span className="post-header-dot">·</span>
                <button
                  className={`post-follow-btn ${isFollowingAuthor ? 'following' : ''}`}
                  onClick={handleFollowClick}
                >
                  {isFollowingAuthor ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>

          <div className="post-header-right">
            <span className="post-date">{formatDate(post.createdAt)}</span>
            {isOwnerOfPost && (
              <div className="post-menu-wrapper" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="post-menu-toggle"
                  title="Options"
                >
                  <MoreVertical size={18} />
                </button>
                {isMenuOpen && (
                  <div className="post-menu-popup">
                    <button onClick={handleDeletePostClick} className="post-menu-delete">
                      <Trash2 size={16} />
                      <span>Delete Post</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="post-content">
          {post.text && <p>{post.text}</p>}
          {isValidImageUrl ? (
            <img
              src={post.imageUrl}
              alt="Post"
              className="post-image"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            post.imageUrl && <p className="invalid-image-text">[{post.imageUrl}]</p>
          )}
        </div>

        <div className="post-stats">
          <span>{post.likes.length} Likes</span>
          <span className="comment-toggle" onClick={() => setShowComments(!showComments)}>
            {post.comments.length} Comments
          </span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="post-actions">
          <button className={`button-like ${isLikedByCurrentUser ? 'liked' : ''}`} onClick={handleLike}>
            <Heart size={18} />
            <span>{isLikedByCurrentUser ? 'Liked' : 'Like'}</span>
          </button>
          <button className="button-comment" onClick={() => setShowComments(!showComments)}>
            <MessageSquare size={18} />
            <span>Comment</span>
          </button>
          <button className={`button-save ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
            <Bookmark size={18} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {showComments && (
          <div className="post-comments">
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              {authUser?.profilePictureUrl && (
                <img src={authUser.profilePictureUrl} alt="My Avatar" className="avatar-small comment-form-avatar" />
              )}
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                className="button-comment-send"
                disabled={isCommenting || !commentText.trim()}
                title="Send comment"
              >
                <ArrowUpCircle size={24} />
              </button>
            </form>

            <div className="comment-list">
              {post.comments.length === 0 ? (
                <p className="no-comments-text">No comments yet.</p>
              ) : (
                post.comments.slice(0).reverse().map((comment) => {
                  const commentAuthorId = comment.user ? String(comment.user._id || comment.user.id) : null;
                  const isOwnerOfComment = authUser && commentAuthorId && (commentAuthorId === currentUserId);
                  const commentAuthor = comment.user || { username: comment.username, profilePictureUrl: comment.profilePictureUrl };

                  return (
                    <div className="comment" key={comment._id}>
                      <Link to={`/profile/${commentAuthorId}`}>
                        <img src={commentAuthor.profilePictureUrl} alt="" className="avatar-small comment-avatar" />
                      </Link>
                      <div className="comment-bubble-wrapper">
                        <div className="comment-body">
                          <Link to={`/profile/${commentAuthorId}`} className="comment-author-name-link">
                            <strong>{commentAuthor.username}</strong>
                          </Link>
                          <p>{comment.text}</p>
                          {isOwnerOfComment && (
                            <button
                              onClick={() => handleDeleteCommentClick(comment._id)}
                              className="delete-button comment-delete-button"
                              title="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PostCard;
