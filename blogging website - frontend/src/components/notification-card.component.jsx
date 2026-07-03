import { Link } from "react-router-dom";

const NotificationCard = ({ notification }) => {
  const { type, seen, createdAt, blog, comment, replied_on_comment, user } =
    notification;

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const iconMap = {
    like: { icon: "fi-sr-heart", color: "text-red" },
    comment: { icon: "fi-sr-comment-dots", color: "text-purple" },
    reply: { icon: "fi-sr-reply-all", color: "text-twitter" },
  };

  const { icon, color } = iconMap[type] || {
    icon: "fi-rr-bell",
    color: "text-dark-grey",
  };

  const messageMap = {
    like: "liked your blog",
    comment: "commented on your blog",
    reply: "replied to a comment on",
  };

  return (
    <div
      className={`flex gap-4 p-5 border-b border-grey ${
        !seen ? "bg-grey/30" : ""
      }`}
    >
      {/* User avatar */}
      <Link
        to={`/profile/${user?.personal_info?.username}`}
        className="flex-shrink-0"
      >
        <img
          src={user?.personal_info?.profile_img}
          alt={user?.personal_info?.fullname}
          className="w-10 h-10 rounded-full object-cover"
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm leading-relaxed">
            <Link
              to={`/profile/${user?.personal_info?.username}`}
              className="font-medium hover:underline"
            >
              {user?.personal_info?.fullname}
            </Link>
            <span className="text-dark-grey">
              {" "}
              {messageMap[type]}{" "}
            </span>
            {blog && (
              <Link
                to={`/blog/${blog._id}`}
                className="font-medium hover:underline"
              >
                {blog.title}
              </Link>
            )}
          </p>

          {/* Unseen dot */}
          {!seen && (
            <span className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-1.5" />
          )}
        </div>

        {/* Comment / reply text preview */}
        {(type === "comment" || type === "reply") && comment?.comment && (
          <p className="mt-2 text-sm text-dark-grey bg-grey rounded-md px-3 py-2 line-clamp-2">
            "{comment.comment}"
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2">
          <i className={`fi ${icon} ${color} text-sm leading-none`} />
          <span className="text-xs text-dark-grey capitalize">{type}</span>
          <span className="text-dark-grey text-xs">·</span>
          <span className="text-xs text-dark-grey">{timeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;