const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^[0-9]{13}$/,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    genre: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);
