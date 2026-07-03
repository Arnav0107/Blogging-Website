import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { toast } from "react-hot-toast";

const BlogInteraction = ({ blog, onCommentClick }) => {
  const { userAuth } = useContext(UserContext);
  const [likes, setLikes] = useState(blog?.activity?.total_likes ?? 0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (!userAuth?.access_token) return toast.error("Sign in to like");
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/blogs/${blog._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      setLiked(data.liked);
      setLikes((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch {
      toast.error("Failed to like");
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-6 my-8">
      {/* Like */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          liked ? "bg-red/20 text-red" : "bg-grey text-dark-grey hover:bg-red/10 hover:text-red"
        }`}
      >
        <i className={`fi ${liked ? "fi-sr-heart" : "fi-rr-heart"} text-lg leading-none`} />
        <span className="text-sm font-medium">{likes}</span>
      </button>

      {/* Comment */}
      <button
        onClick={onCommentClick}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-grey text-dark-grey hover:bg-black/10 transition-all"
      >
        <i className="fi fi-rr-comment text-lg leading-none" />
        <span className="text-sm font-medium">
          {blog?.activity?.total_comments ?? 0}
        </span>
      </button>
    </div>
  );
};

export default BlogInteraction;