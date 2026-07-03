import { useState } from "react";
import { Link } from "react-router-dom";
import CommentField from "./comment-field.component";

const CommentCard = ({ comment, blogId, onCommentAdded }) => {
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const { _id, comment: text, commented_by, commentedAt, children = [] } = comment;
  const { fullname, username, profile_img } = commented_by?.personal_info || {};

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="mb-6">
      {/* Main comment */}
      <div className="flex gap-3">
        <Link to={`/profile/${username}`} className="flex-shrink-0">
          <img
            src={profile_img}
            alt={fullname}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/profile/${username}`} className="text-sm font-medium hover:underline capitalize">
              {fullname}
            </Link>
            <span className="text-dark-grey text-sm">@{username}</span>
            <span className="text-dark-grey text-xs">{timeAgo(commentedAt)}</span>
          </div>
          <p className="text-base leading-relaxed">{text}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            {children.length > 0 && (
              <button
                onClick={() => setShowReplies((p) => !p)}
                className="flex items-center gap-1 text-dark-grey text-sm hover:text-black"
              >
                <i className="fi fi-rr-comment text-sm leading-none" />
                <span>{children.length} {children.length === 1 ? "Reply" : "Replies"}</span>
              </button>
            )}
            <button
              onClick={() => setShowReply((p) => !p)}
              className="text-dark-grey text-sm hover:text-black"
            >
              Reply
            </button>
          </div>

          {/* Reply input */}
          {showReply && (
            <div className="mt-3">
              <CommentField
                blogId={blogId}
                replyingTo={_id}
                onCommentAdded={(c) => {
                  onCommentAdded?.(c);
                  setShowReply(false);
                }}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}

          {/* Nested replies */}
          {showReplies && children.length > 0 && (
            <div className="mt-4 pl-4 border-l border-grey">
              {children.map((reply) => (
                <CommentCard
                  key={reply._id}
                  comment={reply}
                  blogId={blogId}
                  onCommentAdded={onCommentAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;