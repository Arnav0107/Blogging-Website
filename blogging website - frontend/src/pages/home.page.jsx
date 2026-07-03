import { useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPost from "../components/blog-post.component";
import Loader from "../components/loader.component";
import NoData from "../components/nodata.component";

const TAGS = [
  "Education", "Web Dev", "Web3", "Clubs",
  "DSA", "Open Source", "System Design", "Campus Life",
];

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(null);

  const fetchBlogs = async (tag = null) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/blogs/feed`,
        { params: tag ? { tag } : {} }
      );
      setBlogs(data.blogs);
    } catch (err) {
      console.error("Failed to load blogs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    setTrendingLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/blogs/trending`
      );
      setTrending(data.blogs);
    } catch (err) {
      console.error("Failed to load trending", err);
    } finally {
      setTrendingLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(activeTag);
  }, [activeTag]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const handleTagClick = (tag) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* ── LEFT: Feed ── */}
        <div className="w-full max-w-[680px]">
          <InPageNavigation routes={["Home", "Trending"]}>
            {/* Tab 0 — Home feed */}
            <div>
              {loading ? (
                <Loader />
              ) : blogs.length === 0 ? (
                <NoData message="No blogs published yet." />
              ) : (
                blogs.map((blog) => (
                  <AnimationWrapper key={blog._id} transition={{ duration: 0.2 }}>
                    <BlogPost blog={blog} />
                  </AnimationWrapper>
                ))
              )}
            </div>

            {/* Tab 1 — Trending (mobile only, mirrors sidebar) */}
            <div>
              {trendingLoading ? (
                <Loader />
              ) : trending.length === 0 ? (
                <NoData message="Nothing trending right now." />
              ) : (
                trending.map((blog, i) => (
                  <AnimationWrapper key={blog._id} transition={{ duration: 0.2 }}>
                    <TrendingCard blog={blog} index={i} />
                  </AnimationWrapper>
                ))
              )}
            </div>
          </InPageNavigation>
        </div>

        {/* ── RIGHT: Sidebar (hidden on mobile) ── */}
        <div className="min-w-[320px] max-w-[360px] border-l border-grey pl-8 pt-3 max-md:hidden">
          {/* Tags */}
          <div className="mb-8">
            <h2 className="font-medium text-xl mb-4">
              Stories from all interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                    activeTag === tag
                      ? "bg-black text-white"
                      : "bg-grey text-dark-grey hover:bg-black hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div>
            <h2 className="font-medium text-xl mb-4 flex items-center gap-2">
              Trending <i className="fi fi-rr-arrow-trend-up text-lg" />
            </h2>
            {trendingLoading ? (
              <Loader />
            ) : trending.length === 0 ? (
              <NoData message="Nothing trending." />
            ) : (
              trending.slice(0, 5).map((blog, i) => (
                <TrendingCard key={blog._id} blog={blog} index={i} />
              ))
            )}
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

// Trending card used in sidebar + mobile tab
const TrendingCard = ({ blog, index }) => {
  const { _id, title, author, publishedAt } = blog;
  const { fullname, username, profile_img } = author?.personal_info || {};

  const timeAgo = (date) =>
    new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short" });

  return (
    <a href={`/blog/${_id}`} className="flex gap-5 mb-8">
      <span className="text-4xl font-bold text-grey leading-none min-w-[40px]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <img
            src={profile_img}
            alt={fullname}
            className="w-5 h-5 rounded-full object-cover"
          />
          <p className="text-sm font-medium capitalize line-clamp-1">{fullname}</p>
          <span className="text-dark-grey text-sm">@{username}</span>
          <span className="text-dark-grey text-sm">{timeAgo(publishedAt)}</span>
        </div>
        <p className="font-bold text-base leading-snug line-clamp-2">{title}</p>
      </div>
    </a>
  );
};

export default Home;