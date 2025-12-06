# Final Project Enhancement
Enhancement(s) Implemented

Added full Comment System (Create, Edit, Delete)

Added Authorization so only comment owners can edit/delete, and post owners can delete any comment

Implemented automatic timestamps for all comments

Updated UI to show timestamps and conditional action buttons

# Video Demostration
https://www.loom.com/share/4afe6772616c4f6e94374534af08a7f2

# Features Added
Comment Creation

Users can submit comments on posts. New comments display:

Comment author

Timestamp

Comment text

Comment Editing

Users may edit only their own comments.
Edits are validated and reflected instantly in the UI.

Comment Deletion

Deletion rules:

Comment owner → can delete their own comment

Post owner → can delete any comment under their post

Other users → cannot delete comments

Timestamps

Comments automatically include:

createdAt: when the comment was posted

updatedAt: updated when edited

These values are displayed in the browser using React.

# Technical Implementation
Backend

Updated Comment schema to use Mongoose timestamps:

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, trim: true, maxlength: 500 }
}, {
  timestamps: true
});

Added authorization logic inside the DELETE route:

const isCommentOwner = loggedInUserId === commentOwnerId;
const isPostOwner = loggedInUserId === postOwnerId;

if (!isCommentOwner && !isPostOwner) {
  return res.status(403).json({
    message: 'You can only delete your own comments or comments on your own post.'
  });
}


Routes updated:

POST /comments – create comment

PUT /comments/:id – edit comment

DELETE /comments/:id – delete comment

GET /posts/:id/comments – fetch comments for a post

Frontend

Updated CommentList.jsx to:

Display timestamps (formatDate(comment.createdAt))

Show Edit/Delete buttons only when permitted

Refresh comments immediately after any action

Use Axios interceptors to attach JWT tokens automatically

Example UI snippet:

<div className="comment-header">
  <strong>{comment.user?.name}</strong>
  <span className="comment-date">{formatDate(comment.createdAt)}</span>
</div>


# New Dependencies

jwt-decode – used to decode stored JWT tokens in React

Existing dependencies used:

axios

express

mongoose

cors

bcryptjs

jsonwebtoken

Setup Instructions
Backend Setup
cd server
npm install
npm start


Create a .env file:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000

Frontend Setup
cd client
npm install
npm run dev


Visit:

http://localhost:5173