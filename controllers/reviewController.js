const Review = require("../models/Review");
const Book = require("../models/Book");
const mongoose = require("mongoose");

//Add
exports.addReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    let { rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate bookId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    // Validate rating and comment
    rating = parseFloat(rating);
    comment = comment?.trim();

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Check if user already reviewed
    const existingReview = await Review.findOne({ user: userId, book: bookId });
    if (existingReview) return res.status(400).json({ message: "You already reviewed this book" });

    // Create review
    const review = new Review({ user: userId, book: bookId, rating, comment });
    await review.save();

    // Update book's averageRating and totalReviews
    const reviews = await Review.find({ book: bookId });
    book.totalReviews = reviews.length;
    book.averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;
    await book.save();

    res.status(201).json({ message: "Review added successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    let { rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate review ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    // Fetch review
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Check if current user is the owner
    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: you cannot update this review" });
    }

    // Update rating and comment if provided
    if (rating !== undefined) {
      rating = parseFloat(rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      comment = comment.trim();
      if (!comment) {
        return res.status(400).json({ message: "Comment cannot be empty" });
      }
      review.comment = comment;
    }

    await review.save();

    // Update book stats
    const book = await Book.findById(review.book);
    const reviews = await Review.find({ book: review.book });
    book.totalReviews = reviews.length;
    book.averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;
    await book.save();

    res.json({ message: "Review updated successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Delete 
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate review ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ensure current user owns the review
    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: you cannot delete this review" });
    }

    const bookId = review.book;
    await review.remove();

    // Update book stats
    const book = await Book.findById(bookId);
    if (book) {
      const reviews = await Review.find({ book: bookId });
      book.totalReviews = reviews.length;
      book.averageRating =
        reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;
      await book.save();
    }

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

