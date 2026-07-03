import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogs",      // ✅ matches mongoose.model("blogs", blogSchema)
      required: true,
    },
    blog_author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",      // ✅ matches your User model
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    commented_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",      // ✅ same
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",   // ✅ self-ref
      default: null,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
    isReply: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "commentedAt" },
  }
);

export default mongoose.model("comments", commentSchema);