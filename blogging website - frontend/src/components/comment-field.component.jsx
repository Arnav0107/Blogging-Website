import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { toast } from "react-hot-toast";

const CommentField = ({ blogId, onCommentAdded, replyingTo = null, onCancel = null }) => {
  const { userAuth } = useContext(UserContext);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userAuth?.access_token) return toast.error("Sign in to comment");
    if (!comment.trim()) return toast.error("Comment can't be empty");

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/blogs/${blogId}/comments`,
        { comment, replying_to: replyingTo },
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      setComment("");
      onCommentAdded?.(data.comment);
      onCancel?.();
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment..."
        className="w-full bg-grey rounded-lg p-4 resize-none outline-none placeholder:text-dark-grey text-base min-h-[120px]"
      />
      <div className="flex gap-3 mt-3 justify-end">
        {onCancel && (
          <button
            onClick={onCancel}
            className="btn-light py-2 px-6 text-sm"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-dark py-2 px-6 text-sm disabled:opacity-50"
        >
          {loading ? "Posting..." : "Comment"}
        </button>
      </div>
    </div>
  );
};

export default CommentField;