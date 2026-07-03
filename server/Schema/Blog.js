import mongoose, { Schema } from "mongoose";
import { nanoid } from "nanoid";

const blogSchema = mongoose.Schema({
    blog_id: {
        type: String,
        unique: true,
        default: () => nanoid()
    },

    title: {
        type: String,
        required: true,
    },

    banner: {
        type: String,
    },

    banner_public_id: {
        type: String,
    },

    des: {
        type: String,
        maxlength: 200,
    },

    content: {
        type: Object,
        required: true
    },

    tags: {
        type: [String],
        default: []
    },

    author: {
        type: Schema.Types.ObjectId,
        required: false,
        default:null,
        ref: 'users'
    },

    activity: {
        total_likes: { type: Number, default: 0 },
        total_comments: { type: Number, default: 0 },
        total_reads: { type: Number, default: 0 },
        total_parent_comments: { type: Number, default: 0 },
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }],

    draft: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: {
        createdAt: 'publishedAt'
    }
});

export default mongoose.model("blogs", blogSchema);