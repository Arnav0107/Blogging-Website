// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import { getAuth } from "firebase-admin/auth";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schemas
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js"; // ✅ NEW

// Firebase admin
let serviceAccountKey;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccountKey = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "react-js-blog-website-82fff-firebase-adminsdk-fbsvc-b471697bc3.json"),
      "utf8",
    ),
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.diskStorage({});
const upload = multer({ storage });

const server = express();
const PORT = process.env.PORT || 3000;

server.use(cors());
server.use(express.json());

let emailRegex = /^bt\d{2}[a-z]{3}\d{3}@iiitn\.ac\.in$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token. Access denied." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

mongoose
  .connect(process.env.DB_LOCATION, { autoIndex: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let exists = await User.exists({ "personal_info.username": username });
  if (exists) username += nanoid().substring(0, 5);
  return username;
};

const formatUserResponse = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return {
    access_token: token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    email: user.personal_info.email,
  };
};

// ===================== AUTH =====================

server.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || fullname.length < 3) return res.status(400).json({ message: "Full name too short" });
    if (!email || !emailRegex.test(email)) return res.status(400).json({ message: "Invalid IIITN email" });
    if (!password || !passwordRegex.test(password)) return res.status(400).json({ message: "Weak password" });
    const hashed = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);
    const user = new User({ personal_info: { fullname, email, password: hashed, username } });
    await user.save();
    return res.status(200).json(formatUserResponse(user));
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Email already exists" });
    res.status(500).json({ message: err.message });
  }
});

server.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) return res.status(404).json({ message: "Email not found" });
    const match = await bcrypt.compare(password, user.personal_info.password);
    if (!match) return res.status(403).json({ message: "Wrong password" });
    return res.status(200).json(formatUserResponse(user));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===================== IMAGE =====================

server.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "blog_images" });
    res.status(200).json({ imageUrl: result.secure_url, public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.post("/delete-image", async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ message: "public_id required" });
    await cloudinary.uploader.destroy(public_id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== USER =====================

server.put("/api/user/update-profile", verifyJWT, async (req, res) => {
  try {
    const { fullname, bio, profile_img, social_links } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      "personal_info.fullname": fullname,
      "personal_info.bio": bio,
      "personal_info.profile_img": profile_img,
      "social_links.youtube": social_links?.youtube || "",
      "social_links.instagram": social_links?.instagram || "",
      "social_links.facebook": social_links?.facebook || "",
      "social_links.twitter": social_links?.twitter || "",
      "social_links.github": social_links?.github || "",
      "social_links.website": social_links?.website || "",
    }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.get("/api/user/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ "personal_info.username": req.params.username }).select("-personal_info.password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const blogs = await Blog.find({ author: user._id, draft: false }).sort({ publishedAt: -1 });
    res.status(200).json({ user, blogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.get("/api/user/me", verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-personal_info.password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== NOTIFICATIONS =====================

server.get("/api/notifications", verifyJWT, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { notification_for: req.user.id, user: { $ne: req.user.id } };
    if (type && type !== "all") filter.type = type;
    const notifications = await Notification.find(filter)
      .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
      .populate("blog", "title")
      .populate("comment", "comment")
      .populate("replied_on_comment", "comment")
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.get("/api/notifications/unseen-count", verifyJWT, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      notification_for: req.user.id,
      seen: false,
      user: { $ne: req.user.id },
    });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.patch("/api/notifications/seen", verifyJWT, async (req, res) => {
  try {
    await Notification.updateMany({ notification_for: req.user.id, seen: false }, { seen: true });
    res.status(200).json({ message: "Marked as seen" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== BLOG =====================

// ✅ Public feed — latest blogs, optional tag filter
server.get("/api/blogs/feed", async (req, res) => {
  try {
    const { tag, page = 1, limit = 10 } = req.query;
    const query = { draft: false, ...(tag && { tags: { $regex: tag, $options: "i" } }) };
    const blogs = await Blog.find(query)
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json({ blogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Trending blogs
server.get("/api/blogs/trending", async (req, res) => {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort({ "activity.total_reads": -1, "activity.total_likes": -1 })
      .limit(10);
    res.status(200).json({ blogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.post("/api/blogs/create", verifyJWT, async (req, res) => {
  try {
    const { title, banner, banner_public_id, des, content, tags, draft } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title & content required" });
    const newBlog = new Blog({
      title, banner, banner_public_id, des,
      content: content || { blocks: [] },
      tags: tags || [],
      draft: draft ?? true,
      author: req.user.id,
    });
    const savedBlog = await newBlog.save();
    if (!draft) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { "account_info.total_posts": 1 } });
    }
    res.status(201).json({ message: draft ? "Draft saved" : "Blog published", blog: savedBlog });
  } catch (err) {
    console.error("CREATE BLOG ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

server.put("/api/blogs/update/:id", verifyJWT, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.author.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    const { title, banner, banner_public_id, des, content, tags, draft } = req.body;
    blog.title = title ?? blog.title;
    blog.banner = banner ?? blog.banner;
    blog.banner_public_id = banner_public_id ?? blog.banner_public_id;
    blog.des = des ?? blog.des;
    blog.content = content ?? blog.content;
    blog.tags = tags ?? blog.tags;

    const wasPublished = !blog.draft;
    const willBePublished = !(draft ?? blog.draft);
    if (!wasPublished && willBePublished) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { "account_info.total_posts": 1 } });
    } else if (wasPublished && !willBePublished) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { "account_info.total_posts": -1 } });
    }

    blog.draft = draft ?? blog.draft;
    const updatedBlog = await blog.save();
    res.status(200).json({ message: "Blog updated", blog: updatedBlog });
  } catch (err) {
    console.error("UPDATE BLOG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

server.get("/api/blogs/user", verifyJWT, async (req, res) => {
  try {
    const { draft } = req.query;
    const query = { author: req.user.id, ...(draft !== undefined && { draft: draft === "true" }) };
    const blogs = await Blog.find(query).sort({ publishedAt: -1 });
    res.status(200).json({ blogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.get("/api/blogs/user/search", verifyJWT, async (req, res) => {
  try {
    const { q, draft } = req.query;
    const query = {
      author: req.user.id,
      ...(draft !== undefined && { draft: draft === "true" }),
      ...(q && { title: { $regex: q, $options: "i" } }),
    };
    const blogs = await Blog.find(query).sort({ publishedAt: -1 });
    res.status(200).json({ blogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Public read — increments reads. MUST be before /api/blogs/:id
server.get("/api/blogs/read/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img personal_info.bio");
    if (!blog || blog.draft) return res.status(404).json({ message: "Blog not found" });
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { "activity.total_reads": 1 } });
    await User.findByIdAndUpdate(blog.author, { $inc: { "account_info.total_reads": 1 } });
    res.status(200).json({ blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Like / unlike
server.post("/api/blogs/:id/like", verifyJWT, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const alreadyLiked = await Notification.findOne({ type: "like", blog: blog._id, user: req.user.id });
    if (alreadyLiked) {
      await alreadyLiked.deleteOne();
      await Blog.findByIdAndUpdate(blog._id, { $inc: { "activity.total_likes": -1 } });
      return res.status(200).json({ liked: false });
    }
    await Notification.create({ type: "like", blog: blog._id, notification_for: blog.author, user: req.user.id });
    await Blog.findByIdAndUpdate(blog._id, { $inc: { "activity.total_likes": 1 } });
    res.status(200).json({ liked: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get comments
server.get("/api/blogs/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ blog_id: req.params.id, isReply: false })
      .populate("commented_by", "personal_info.fullname personal_info.username personal_info.profile_img")
      .populate({
        path: "children",
        populate: { path: "commented_by", select: "personal_info.fullname personal_info.username personal_info.profile_img" },
      })
      .sort({ commentedAt: -1 });
    res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Post a comment or reply
server.post("/api/blogs/:id/comments", verifyJWT, async (req, res) => {
  try {
    const { comment, replying_to } = req.body;
    if (!comment?.trim()) return res.status(400).json({ message: "Comment required" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const newComment = await Comment.create({
      blog_id: blog._id,
      blog_author: blog.author,
      comment,
      commented_by: req.user.id,
      isReply: !!replying_to,
      parent: replying_to || null,
    });

    if (replying_to) {
      await Comment.findByIdAndUpdate(replying_to, { $push: { children: newComment._id } });
    }

    await Blog.findByIdAndUpdate(blog._id, { $inc: { "activity.total_comments": 1 } });

    if (blog.author.toString() !== req.user.id) {
      await Notification.create({
        type: replying_to ? "reply" : "comment",
        blog: blog._id,
        notification_for: blog.author,
        user: req.user.id,
        comment: newComment._id,
        replied_on_comment: replying_to || null,
      });
    }

    const populated = await Comment.findById(newComment._id).populate(
      "commented_by",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    );
    res.status(201).json({ comment: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Owner only — editor (no read increment)
server.get("/api/blogs/:id", verifyJWT, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.author.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    res.status(200).json({ blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.delete("/api/blogs/:id", verifyJWT, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.author.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    await blog.deleteOne();
    if (!blog.draft) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { "account_info.total_posts": -1 } });
    }
    await Notification.deleteMany({ blog: blog._id });
    await Comment.deleteMany({ blog_id: blog._id }); // ✅ cleanup comments too
    res.status(200).json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== START =====================
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});