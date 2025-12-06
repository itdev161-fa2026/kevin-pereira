import { useState } from 'react';

export default function CommentForm({ initialValue = '', onSubmit, submitting }) {
  const [body, setBody] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSubmit(body.trim());
    setBody('');
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows="3"
        placeholder="Write a comment..."
      />
      <button type="submit" disabled={submitting || !body.trim()}>
        {submitting ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
