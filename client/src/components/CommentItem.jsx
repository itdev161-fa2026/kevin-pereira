import { useState } from 'react';
import CommentForm from './CommentForm';

export default function CommentItem({ comment, currentUserId, onUpdate, onDelete }) {
  const isOwner = comment.user?._id === currentUserId;
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (newBody) => {
    await onUpdate(comment._id, newBody);
    setIsEditing(false);
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <strong>{comment.user?.name}</strong>
        <span>{new Date(comment.createDate).toLocaleString()}</span>
      </div>

      {isEditing ? (
        <CommentForm
          initialValue={comment.body}
          onSubmit={handleUpdate}
          submitting={false}
        />
      ) : (
        <p>{comment.body}</p>
      )}

      {isOwner && !isEditing && (
        <div className="comment-actions">
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete(comment._id)}>Delete</button>
        </div>
      )}

      {isOwner && isEditing && (
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      )}
    </div>
  );
}
