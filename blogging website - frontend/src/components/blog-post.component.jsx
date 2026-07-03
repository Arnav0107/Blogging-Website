import { Link } from "react-router-dom";

const BlogPost = ({ blog }) => {
  const {
    _id,
    title,
    des,
    banner,
    tags,
    author,
    publishedAt,
    activity,
  } = blog;

  const { fullname, username, profile_img } = author?.personal_info || {};

  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
  };

  return (
    <div className="flex gap-8 items-center border-b border-grey pb-5 mb-5">
      {/* Left: text content */}
      <div className="flex-1 min-w-0">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={profile_img}
            alt={fullname}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
          <Link
            to={`/profile/${username}`}
            className="text-sm font-medium hover:underline capitalize"
          >
            {fullname}
          </Link>
          <span className="text-dark-grey text-sm">@</span>
          <Link
            to={`/profile/${username}`}
            className="text-dark-grey text-sm hover:underline"
          >
            {username}
          </Link>
          <span className="text-dark-grey text-sm">
            · {timeAgo(publishedAt)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/blog/${_id}`}>
          <h2 className="text-xl font-bold leading-snug hover:underline line-clamp-2 mb-2">
            {title}
          </h2>
        </Link>

        {/* Description */}
        <p className="text-dark-grey text-sm leading-relaxed line-clamp-2 mb-4 max-md:hidden">
          {des}
        </p>

        {/* Tags + likes row */}
        <div className="flex items-center gap-4">
          {tags?.[0] && (
            <span className="bg-grey text-dark-grey text-sm px-4 py-1 rounded-full capitalize">
              {tags[0]}
            </span>
          )}
          <div className="flex items-center gap-1 text-dark-grey text-sm ml-2">
            <i className="fi fi-rr-heart text-sm leading-none" />
            <span>{activity?.total_likes ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Right: banner */}
      {banner && (
        <Link
          to={`/blog/${_id}`}
          className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden"
        >
          <img src={banner} alt={title} className="w-full h-full object-cover" />
        </Link>
      )}
    </div>
  );
};

export default BlogPost;