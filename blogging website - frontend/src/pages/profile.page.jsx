import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/user/profile/${username}`
        );
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || "User not found");
          return;
        }
        setProfile(data.user);
        setBlogs(data.blogs || []);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-dark-grey animate-pulse">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center mt-20 text-dark-grey">User not found</div>
    );
  }

  const {
    personal_info: { fullname, username: uname, bio, profile_img },
    account_info: { total_reads },
    social_links,
    joinedAt,
  } = profile;

  // Derive from actual blogs array — always accurate regardless of DB counter sync
  const total_posts = blogs.length;

  const socialList = [
    { key: "youtube",   icon: "fi-brands-youtube"   },
    { key: "instagram", icon: "fi-brands-instagram"  },
    { key: "facebook",  icon: "fi-brands-facebook"   },
    { key: "twitter",   icon: "fi-brands-twitter"    },
    { key: "github",    icon: "fi-brands-github"     },
    { key: "website",   icon: "fi-rr-link"           },
  ];

  return (
    <AnimationWrapper>
      <Toaster />
      <div className="max-w-[1100px] mx-auto px-6 py-10 flex gap-12 max-md:flex-col">

        {/* LEFT — profile info */}
        <div className="w-[280px] flex-none max-md:w-full">

          {/* Profile pic + name */}
          <img
            src={profile_img}
            alt={fullname}
            className="w-28 h-28 rounded-full object-cover"
          />
          <h1 className="text-2xl font-bold mt-4 capitalize">{fullname}</h1>
          <p className="text-dark-grey mt-1">@{uname}</p>

          {/* Bio */}
          {bio && (
            <p className="mt-4 text-sm leading-relaxed">{bio}</p>
          )}

          {/* Stats */}
          <div className="flex gap-8 mt-6">
            <div>
              <p className="text-xl font-medium">{total_posts}</p>
              <p className="text-dark-grey text-sm">Posts</p>
            </div>
            <div>
              <p className="text-xl font-medium">{total_reads}</p>
              <p className="text-dark-grey text-sm">Reads</p>
            </div>
          </div>

          {/* Join date */}
          <p className="text-dark-grey text-sm mt-6">
            Joined{" "}
            {new Date(joinedAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Social links — only show if filled */}
          <div className="flex gap-4 mt-6 flex-wrap">
            {socialList.map(({ key, icon }) =>
              social_links?.[key] ? (
                <a
                  key={key}
                  href={social_links[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-dark-grey hover:text-black text-2xl"
                >
                  <i className={`fi ${icon}`} />
                </a>
              ) : null
            )}
          </div>

        </div>

        {/* RIGHT — published blogs */}
        <div className="flex-1">
          <h2 className="text-xl font-medium mb-6">
            Published Blogs
            <span className="text-dark-grey text-base font-normal ml-2">
              ({blogs.length})
            </span>
          </h2>

          {blogs.length === 0 ? (
            <p className="text-dark-grey">No published blogs yet.</p>
          ) : (
            blogs.map((blog) => (
              <div
                key={blog._id}
                className="flex gap-6 border-b border-grey pb-6 mb-6"
              >
                {/* Banner */}
                <img
                  src={blog.banner}
                  alt={blog.title}
                  className="w-24 h-24 object-cover rounded-lg flex-none"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-dark-grey text-sm mt-1 line-clamp-2">
                    {blog.des}
                  </p>
                  <p className="text-dark-grey text-xs mt-2">
                    {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </AnimationWrapper>
  );
};

export default Profile;