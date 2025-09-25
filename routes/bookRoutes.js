const express = require("express");
const router = express.Router();
const {
  addBook,
  getBooks,
  getBookById,
  searchBooks,
} = require("../controllers/bookController");
const { authenticateToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management and retrieval
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isbn
 *               - title
 *               - author
 *             properties:
 *               isbn:
 *                 type: string
 *                 example: "9780132350884"
 *               title:
 *                 type: string
 *                 example: "Clean Code"
 *               author:
 *                 type: string
 *                 example: "Robert C. Martin"
 *               genre:
 *                 type: string
 *                 example: "Programming"
 *               description:
 *                 type: string
 *                 example: "A handbook of agile software craftsmanship"
 *     responses:
 *       201:
 *         description: Book added successfully
 *       400:
 *         description: Book already exists
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateToken, addBook);

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with optional filters and pagination
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *           example: "Martin"
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           example: "Programming"
 *     responses:
 *       200:
 *         description: List of books
 */
router.get("/", getBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book details by ID (with paginated reviews)
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 651f2b2c1234567890abcdef
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Book details with reviews
 *       404:
 *         description: Book not found
 */
router.get("/:id", getBookById);

/**
 * @swagger
 * /books/search/query:
 *   get:
 *     summary: Search books by title, author, or ISBN
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: "Clean Code"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing query parameter
 */
router.get("/search/query", searchBooks);

module.exports = router;
