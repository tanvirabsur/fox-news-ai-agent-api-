const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    id: String,
    title: String,
    slug: {
      type: String,
      unique: true,
    },
    link: String,
    thumbnail: String,

    content: String,
    excerpt: String,

    category: String,

    isFeatured: {
      type: Boolean,
      default: false,
    },

    readingTime: String,

    author: {
      name: String,
      role: String,
      avatar: String,
      bio: String,
    },

    meta: {
      views: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        default: "published",
      },
      tags: [String],
    },

    published_at: String,
    scraped_at: String,
  },
  {
    timestamps: true,
  }
);
const articals = mongoose.model("Articals", NewsSchema, "news");

module.exports = { articals };