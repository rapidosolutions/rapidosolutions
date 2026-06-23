import mongoose from "mongoose";

const coverImageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
    storageType: { type: String, enum: ["cloudinary", "local"], default: "cloudinary" },
    alt: { type: String, default: "" }
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: "Business", trim: true, maxlength: 80 },
    summary: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, required: true, trim: true, maxlength: 50000 },
    author: { type: String, default: "Rapido Editorial", trim: true, maxlength: 100 },
    readTime: { type: String, default: "3 min read", maxlength: 30 },
    published: { type: Boolean, default: true, index: true },
    coverImage: { type: coverImageSchema, default: null }
  },
  { timestamps: true }
);

blogSchema.index({ published: 1, createdAt: -1 });

export const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
