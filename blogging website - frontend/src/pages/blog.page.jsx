import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import BlogContent from "../components/blog-content.component";
import BlogInteraction from "../components/blog-interaction.component";
import CommentsPanel from "../components/comments.component";

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/blogs/read/${id}`
        );
        setBlog(data.blog);

        // Fetch comments
        const { data: cData } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/blogs/${id}/comments`
        );
        setComments(cData.comments || []);
      } catch (err) {
        console.error("Failed to load blog", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
    // Increment comment count on blog state
    setBlog((prev) => ({
      ...prev,
      activity: {
        ...prev.activity,
        total_comments: (prev.activity?.total_comments ?? 0) + 1,
      },
    }));
  };

  if (loading) {
    return (
      <div className="mt-20">
        <Loader />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center mt-20 text-dark-grey">Blog not found.</div>
    );
  }

  const {
    title,
    banner,
    des,
    content,
    tags,
    author,
    publishedAt,
    activity,
  } = blog;

  const { fullname, username, profile_img, bio } =
    author?.personal_info || {};

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <AnimationWrapper>
      <Toaster />

      <div className="max-w-[900px] mx-auto px-5 py-10">
        {/* Banner */}
        {banner && (
          <img
            src={banner}
            alt={title}
            className="w-full aspect-video object-cover rounded-2xl mb-8"
          />
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold leading-tight mb-6 max-md:text-3xl">
          {title}
        </h1>

        {/* Author row */}
        <div className="flex items-center justify-between gap-4 border-b border-grey pb-6 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${username}`}>
              <img
                src={profile_img}
                alt={fullname}
                className="w-12 h-12 rounded-full object-cover"
              />
            </Link>
            <div>
              <Link
                to={`/profile/${username}`}
                className="font-medium capitalize hover:underline"
              >
                {fullname}
              </Link>
              <p className="text-dark-grey text-sm">@{username}</p>
            </div>
          </div>
          <p className="text-dark-grey text-sm">Published {formattedDate}</p>
        </div>

        {/* Like + Comment interaction */}
        <BlogInteraction
          blog={blog}
          onCommentClick={() => setShowComments(true)}
        />

        {/* Blog content blocks */}
        <div className="blog-page-content">
          {content?.blocks?.map((block, i) => (
            <BlogContent key={i} block={block} />
          ))}
        </div>

        {/* Tags */}
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-grey">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-grey text-dark-grey text-sm px-4 py-2 rounded-full capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author card */}
        <div className="mt-12 pt-8 border-t border-grey flex gap-5 items-start">
          <Link to={`/profile/${username}`} className="flex-shrink-0">
            <img
              src={profile_img}
              alt={fullname}
              className="w-16 h-16 rounded-full object-cover"
            />
          </Link>
          <div>
            <p className="text-sm text-dark-grey mb-1">Written by</p>
            <Link
              to={`/profile/${username}`}
              className="text-xl font-bold capitalize hover:underline"
            >
              {fullname}
            </Link>
            {bio && <p className="text-dark-grey text-sm mt-2">{bio}</p>}
          </div>
        </div>
      </div>

      {/* Comments panel overlay */}
      {showComments && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowComments(false)}
          />
          <CommentsPanel
            blogId={id}
            blogTitle={title}
            comments={comments}
            onClose={() => setShowComments(false)}
            onCommentAdded={handleCommentAdded}
          />
        </>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;