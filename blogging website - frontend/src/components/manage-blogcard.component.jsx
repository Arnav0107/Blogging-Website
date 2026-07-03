import { Link } from "react-router-dom";

const ManageBlogCard = ({ blog, onDelete }) => {
  const date = new Date(blog.publishedAt || blog.createdAt);
  const formatted = date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    weekday: "long",
  });

  return (
    <div className="flex items-center gap-6 border-b border-grey pb-6 mb-6">
      {/* Banner */}
      <img
        src={blog.banner || "/imgs/blog banner.png"}
        className="w-28 h-28 object-cover rounded-lg flex-none"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-medium line-clamp-1">{blog.title}</h2>
        <p className="text-dark-grey text-sm mt-1">
          Published on {formatted}
        </p>
        <div className="flex gap-4 mt-3">
          <Link
            to={`/editor/${blog._id}`}
            className="text-sm underline hover:text-black"
          >
            Edit
          </Link>
          <button
            onClick={onDelete}
            className="text-sm text-red underline hover:opacity-70"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-center flex-none">
        {[
          { label: "Likes", value: blog.activity?.total_likes ?? 0 },
          { label: "Comments", value: blog.activity?.total_comments ?? 0 },
          { label: "Reads", value: blog.activity?.total_reads ?? 0 },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-2xl font-medium">{value}</p>
            <p className="text-dark-grey text-sm">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageBlogCard;