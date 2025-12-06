import { useState, useEffect } from "react";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/api";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleString();
};

const CommentList = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [newBody, setNewBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getComments(postId);
      setComments(data);
      setError(null);
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBody.trim()) return;

    try {
      setSubmitting(true);
      await createComment(postId, newBody.trim());
      setNewBody("");
      await loadComments();
    } catch (err) {
      console.error("Error creating comment:", err);
      alert(
        err.response?.data?.message || "Failed to create comment. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete comment. You may not be the owner."
      );
    }
  };

  const handleEdit = async (comment) => {
    const updated = window.prompt("Edit your comment:", comment.body);
    if (updated == null) return; // cancelled
    const trimmed = updated.trim();
    if (!trimmed) return;

    try {
      await updateComment(comment._id, trimmed);
      await loadComments();
    } catch (err) {
      console.error("Error updating comment:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update comment. You may not be the owner."
      );
    }
  };

  // Only the comment owner can modify their comment
  const canModifyComment = (comment) =>
    user && comment.user && user.id === comment.user._id;

  return (
    <section className="comments-section">
      <h2>Comments ({comments.length})</h2>

      {/* Add Comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
          />
          <button type="submit" disabled={submitting || !newBody.trim()}>
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p>You must be logged in to comment.</p>
      )}

      {/* Comments List */}
      {loading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment._id} className="comment-item">
              <div className="comment-header">
                <strong>{comment.user?.name || "Unknown"}</strong>

                {/* 🔥 Show timestamp */}
                <span className="comment-date">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              <p>{comment.body}</p>

              {canModifyComment(comment) && (
                <div className="comment-actions">
                  <button onClick={() => handleEdit(comment)}>Edit</button>
                  <button onClick={() => handleDelete(comment._id)}>
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CommentList;
