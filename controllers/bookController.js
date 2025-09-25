const Book = require("../models/Book");
const Review = require("../models/Review");
const mongoose = require("mongoose");

//Add
exports.addBook = async (req, res) => {
  try {
    let { isbn, title, author, genre, description } = req.body;

    // Trim inputs
    isbn = isbn?.toString().trim();
    title = title?.trim();
    author = author?.trim();
    genre = genre?.trim();
    description = description?.trim();

    // Validate required fields
    if (!isbn || !title || !author ) {
      return res.status(400).json({ message: "ISBN, title, author, and genre are required" });
    }

    // Validate ISBN
    const isbnRegex = /^\d{13}$/;
    if (!isbnRegex.test(isbn)) {
      return res.status(400).json({ message: "ISBN must be exactly 13 digits" });
    }

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: "A book with this ISBN already exists" });
    }

    const book = new Book({ isbn, title, author, genre, description });
    await book.save();

    res.status(201).json({ message: "Book added successfully", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Get All books (optional filters: author, genre)
exports.getBooks = async (req, res) => {
  try {

    let { page = 1, limit = 10, author, genre } = req.query;

    // Parse and validate pagination
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 50) limit = 10; // max 50 per page


    const filter = {};
    if (author) {
      filter.author = { $regex: author, $options: "i" };
    }

    if (genre) {
      filter.genre = { $regex: genre, $options: "i" };
    }

    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(filter);

    if (books.length === 0) {
      return res.status(404).json({
        message: "No books found",
        page,
        limit,
        total,
        books: [],
      });
    }

    res.json({ page, limit, total, books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Get by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    let { page = 1, limit = 5 } = req.query;

    //Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    //Parse and validate pagination
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 50) limit = 5;

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Fetch reviews with pagination
    const reviews = await Review.find({ book: id })
      .populate("user", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const reviewsCount = await Review.countDocuments({ book: id });

    // Handle no reviews scenario
    const reviewsMessage = reviews.length === 0 ? "No reviews found for this book" : null;

    res.json({
      book,
      reviews,
      reviewsCount,
      reviewsMessage,
      page,
      limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params; // book ID
    let { isbn, title, author, genre, description } = req.body;

    // Validate book ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    isbn = isbn?.trim();
    title = title?.trim();
    author = author?.trim();
    genre = genre?.trim();
    description = description?.trim();

    // Validate ISBN format if provided
    if (isbn && isbn !== book.isbn) {
      const isbnRegex = /^\d{13}$/;
      if (!isbnRegex.test(isbn)) {
        return res.status(400).json({ message: "ISBN must be exactly 13 digits" });
      }

      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(400).json({ message: "ISBN already exists" });
      }
      book.isbn = isbn;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (description) book.description = description;

    await book.save();

    res.json({ message: "Book updated successfully", book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


//Search query
exports.searchBooks = async (req, res) => {
  try {
    let { q, page = 1, limit = 10 } = req.query;

    if (!q) return res.status(400).json({ message: "Query 'q' is required" });

    q = q.trim();
    if (!q) return res.status(400).json({ message: "Query cannot be empty" });

    // Escape regex special characters
    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = { $regex: escapeRegex(q), $options: "i" };

    // Validate pagination
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 50) limit = 10;

    const filter = { $or: [{ title: regex }, { author: regex }, { isbn: regex }] };

    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(filter);

    if (books.length === 0) {
      return res.status(404).json({ message: "No books found matching your query", page, limit, total, books: [] });
    }

    res.json({ page, limit, total, books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Delete
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate book ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Delete all reviews associated with this book
    await Review.deleteMany({ book: id });

    await Book.deleteOne({ _id: id });

    res.json({ message: "Book and its reviews deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};