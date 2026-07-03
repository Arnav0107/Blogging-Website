import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import ManageBlogCard from "../components/manage-blogcard.component";

const ManageBlogs = () => {
  const { userAuth } = useContext(UserContext);
  const [blogs, setBlogs] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [activeTab, setActiveTab] = useState("published");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBlogs = async (draft, query = "") => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/blogs/user${query ? "/search" : ""}`,
        {
          params: { draft, q: query || undefined },
          headers: { Authorization: `Bearer ${userAuth.access_token}` },
        }
      );
      draft ? setDrafts(data.blogs) : setBlogs(data.blogs);
    } catch (err) {
      toast.error("Failed to load blogs");
    }
  };

  useEffect(() => {
    fetchBlogs(false);
    fetchBlogs(true);
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    fetchBlogs(activeTab === "drafts", q);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/blogs/${id}`,
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      toast.success("Blog deleted");
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      setDrafts((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const displayed = activeTab === "published" ? blogs : drafts;

  return (
    <div>
      <Toaster />
      <h1 className="text-2xl font-medium mb-6">Manage Blogs</h1>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search Blogs"
          className="w-full bg-grey p-4 pl-12 rounded-full outline-none"
        />
        <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-grey">
        {["published", "drafts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize ${
              activeTab === tab
                ? "border-b-2 border-black font-medium"
                : "text-dark-grey"
            }`}
          >
            {tab === "published" ? "Published Blogs" : "Drafts"}
          </button>
        ))}
      </div>

      {/* Blog list */}
      {displayed.length === 0 ? (
        <p className="text-dark-grey text-center mt-10">No blogs found</p>
      ) : (
        displayed.map((blog) => (
          <ManageBlogCard
            key={blog._id}
            blog={blog}
            onDelete={() => handleDelete(blog._id)}
          />
        ))
      )}
    </div>
  );
};

export default ManageBlogs;