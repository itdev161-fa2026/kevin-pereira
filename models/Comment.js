import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 500,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Comment', commentSchema);
