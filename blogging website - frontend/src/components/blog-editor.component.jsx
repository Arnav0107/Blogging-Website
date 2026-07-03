import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../App";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import { Toaster, toast } from "react-hot-toast";

const BlogEditor = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const location = useLocation();
  const isDraft = location.state?.isDraft ?? false;

  const [banner, setBanner] = useState(defaultBanner);
  const [publicId, setPublicId] = useState("");
  const [title, setTitle] = useState("");
  const [editorContent, setEditorContent] = useState(null);
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [des, setDes] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [draftStatus, setDraftStatus] = useState(false);

  const editorRef = useRef(null);
  const savedContentRef = useRef(null); // ✅ holds fetched content until DOM is ready
  const { userAuth } = useContext(UserContext);
  const navigate = useNavigate();

  const initEditor = (savedData = null) => {
    if (editorRef.current) return;
    editorRef.current = new EditorJS({
      holder: "editorjs",
      placeholder: "Write your blog here...",
      data: savedData || { blocks: [] },
      tools: {
        header: Header,
        list: List,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (file) => {
                const formData = new FormData();
                formData.append("image", file);
                const res = await fetch("http://localhost:3000/upload-image", {
                  method: "POST",
                  body: formData,
                });
                const data = await res.json();
                return { success: 1, file: { url: data.imageUrl } };
              },
            },
          },
        },
      },
    });
  };

  // ✅ Fetch blog data in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchBlog = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/blogs/${id}`, {
            headers: { Authorization: `Bearer ${userAuth.access_token}` },
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message || "Failed to load blog");
            navigate("/dashboard/blogs");
            return;
          }

          const blog = data.blog;
          setBanner(blog.banner || defaultBanner);
          setPublicId(blog.banner_public_id || "");
          setTitle(blog.title || "");
          setPublishTitle(blog.title || "");
          setDes(blog.des || "");
          setTags(blog.tags || []);

          setDraftStatus(blog.draft || false);


          // ✅ Save content to ref BEFORE setLoading(false)
          // so it's available when the effect below runs
          savedContentRef.current = blog.content;
          setLoading(false); // triggers re-render → #editorjs div appears
        } catch (err) {
          console.error(err);
          toast.error("Something went wrong");
          setLoading(false);
        }
      };
      fetchBlog();
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [id]);

  // ✅ Init editor AFTER loading is false (DOM is ready)
  useEffect(() => {
    if (loading) return; // wait until spinner is gone and #editorjs is in DOM
    // Small timeout to ensure React has painted the #editorjs div
    const timer = setTimeout(() => {
      initEditor(savedContentRef.current); // null in create mode, blog.content in edit mode
    }, 50);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (publicId) await deleteImage();
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("http://localhost:3000/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setBanner(data.imageUrl);
      setPublicId(data.public_id);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteImage = async () => {
    if (!publicId) return;
    await fetch("http://localhost:3000/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId }),
    });
  };

  // ✅ Opens publish panel — works for both publish & update
  const handleOpenPublishPanel = async () => {
    if (!title.trim()) return toast.error("Please add a blog title.");
    const content = await editorRef.current.save();
    if (!content.blocks.length) return toast.error("Blog content cannot be empty.");
    setEditorContent(content);
    setPublishTitle(title);
    setShowPublishPanel(true);
  };

  // ✅ Handles both: publish new, update existing, publish draft
  const handlePublish = async () => {
    if (!publishTitle.trim()) return toast.error("Blog title is required.");
    if (!des.trim()) return toast.error("Short description is required.");
    if (!tags.length) return toast.error("Add at least one tag.");

    const payload = {
      title: publishTitle,
      banner,
      banner_public_id: publicId,
      des,
      content: editorContent,
      tags,
      draft: false, // always publishing here
    };

    try {
      const url = isEditMode
        ? `http://localhost:3000/api/blogs/update/${id}`
        : `http://localhost:3000/api/blogs/create`;

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userAuth.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Failed to save");

      // ✅ Smart success message
      const msg = !isEditMode
        ? "Blog published!"
        : isDraft
        ? "Draft published!"
        : "Blog updated!";

      toast.success(msg);
      setShowPublishPanel(false);
      setTimeout(() => navigate("/dashboard/blogs"), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) return toast.error("Please add a blog title.");
    const content = await editorRef.current.save();

    const payload = {
      title,
      banner,
      banner_public_id: publicId,
      content,
      draft: true,
    };

    try {
      const url = isEditMode
        ? `http://localhost:3000/api/blogs/update/${id}`
        : `http://localhost:3000/api/blogs/create`;

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userAuth.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Failed to save draft");

      toast.success(isEditMode ? "Draft updated!" : "Draft saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save draft.");
    }
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= 10) return toast.error("Max 10 tags allowed.");
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // ✅ Label logic
  const navbarBtnLabel = !isEditMode ? "Publish" : draftStatus ? "Publish" : "Update";
  const panelBtnLabel = !isEditMode ? "Publish" : draftStatus ? "Publish Draft" : "Update Blog";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-lg animate-pulse">Loading blog...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster />

      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} className="w-full" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">{title}</p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handleOpenPublishPanel}>
            {navbarBtnLabel}
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            {isEditMode ? "Update Draft" : "Save Draft"}
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            {/* BANNER */}
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img src={banner} className="z-20" />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png,.jpg,.jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            {/* TITLE */}
            <input
              type="text"
              placeholder="Blog Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold outline-none mt-6"
            />

            {/* EDITOR */}
            <div id="editorjs" className="mt-10"></div>
          </div>
        </section>
      </AnimationWrapper>

      {/* PUBLISH / UPDATE PANEL */}
      {showPublishPanel && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <button
            className="absolute top-6 right-6 text-2xl text-gray-500 hover:text-black"
            onClick={() => setShowPublishPanel(false)}
          >
            ✕
          </button>

          <div className="flex flex-col md:flex-row gap-10 max-w-[1000px] mx-auto px-6 py-16">
            {/* LEFT — Preview */}
            <div className="md:w-1/2">
              <p className="text-gray-500 mb-3">Preview</p>
              <img src={banner} alt="banner" className="w-full aspect-video object-cover rounded" />
              <h1 className="text-2xl font-bold mt-4">{publishTitle || "Blog Title"}</h1>
              <p className="text-gray-500 mt-2 text-sm">{des || "Short description will appear here."}</p>
            </div>

            {/* RIGHT — Fields */}
            <div className="md:w-1/2 flex flex-col gap-5">
              <div>
                <label className="text-sm text-gray-500">Blog Title</label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full border-b border-gray-300 outline-none py-2 text-lg mt-1 bg-gray-100 px-3 rounded"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Short Description about your post</label>
                <textarea
                  value={des}
                  onChange={(e) => { if (e.target.value.length <= 200) setDes(e.target.value); }}
                  rows={4}
                  className="w-full border border-gray-300 outline-none p-3 mt-1 resize-none bg-gray-100 rounded"
                />
                <p className="text-right text-xs text-gray-400">{200 - des.length} characters left</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Topics - ( Helps in searching and ranking your post )</label>
                <input
                  type="text"
                  placeholder="Topic"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="w-full border border-gray-300 outline-none p-3 mt-1 bg-gray-100 rounded"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-black">✕</button>
                    </span>
                  ))}
                </div>
                <p className="text-right text-xs text-gray-400 mt-1">{10 - tags.length} Tags left</p>
              </div>

              <button className="btn-dark py-3 px-8 rounded-full w-fit mt-2" onClick={handlePublish}>
                {panelBtnLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogEditor;