import express from 'express';
import Comment from '../../models/Comment.js';
import Post from '../../models/Post.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.post('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { body } = req.body;
    const { postId } = req.params;

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ message: 'Comment body is required.' });
    }

    if (body.length > 500) {
      return res.status(400).json({ message: 'Comment must be 500 characters or less.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const userId = (req.user.id || req.user._id)?.toString();

    if (!userId) {
      return res.status(401).json({ message: 'User not found in token.' });
    }

    const comment = await Comment.create({
      post: postId,
      user: userId,              
      body: body.trim(),
    });

    await comment.populate('user', 'name');

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating comment.' });
  }
});

router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate('user', 'name')
      .sort({ createdAt: -1 }); // newest first

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching comments.' });
  }
});

router.put('/comments/:id', auth, async (req, res) => {
  try {
    const { body } = req.body;
    const { id } = req.params;

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ message: 'Comment body is required.' });
    }
    if (body.length > 500) {
      return res.status(400).json({ message: 'Comment must be 500 characters or less.' });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const ownerId = comment.user.toString();
    const loggedInUserId = (req.user.id || req.user._id)?.toString();

    console.log('PUT comment ownerId:', ownerId);
    console.log('PUT loggedInUserId:', loggedInUserId);

    if (!loggedInUserId || ownerId !== loggedInUserId) {
      return res.status(403).json({ message: 'You can only edit your own comments.' });
    }

    comment.body = body.trim();
    await comment.save();

    await comment.populate('user', 'name');

    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating comment.' });
  }
});

router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const loggedInUserId = (req.user.id || req.user._id)?.toString();
    if (!loggedInUserId) {
      return res.status(401).json({ message: 'User not found in token.' });
    }

    const commentOwnerId = comment.user.toString();

  
    const post = await Post.findById(comment.post);
    if (!post) {
      return res.status(404).json({ message: 'Post not found for this comment.' });
    }
    const postOwnerId = post.user.toString();

    console.log('DELETE commentOwnerId:', commentOwnerId);
    console.log('DELETE postOwnerId:', postOwnerId);
    console.log('DELETE loggedInUserId:', loggedInUserId);

   
    const isCommentOwner = loggedInUserId === commentOwnerId;
    const isPostOwner = loggedInUserId === postOwnerId;

    if (!isCommentOwner && !isPostOwner) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own comments or comments on your own post.' });
    }

    await comment.deleteOne();

    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting comment.' });
  }
});

export default router;