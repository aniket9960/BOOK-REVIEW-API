const express = require("express");
const router = express.Router();
const {
  addBook,
  getBooks,
  getBookById,
  searchBooks,
  updateBook,
  deleteBook
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

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book by ID
 *     description: Updates the details of a book. Requires authentication.
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fields to update (all optional)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isbn:
 *                 type: string
 *                 example: "9781234567890"
 *                 description: Must be exactly 13 digits
 *               title:
 *                 type: string
 *                 example: "Harry Potter and the Goblet of Fire"
 *               author:
 *                 type: string
 *                 example: "J.K. Rowling"
 *               genre:
 *                 type: string
 *                 example: "Fantasy"
 *               description:
 *                 type: string
 *                 example: "Fourth book in the Harry Potter series"
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book updated successfully"
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request (invalid ID, invalid ISBN, duplicate ISBN)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticateToken, updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     description: Deletes a book and all its associated reviews. Requires authentication.
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the book to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book and its reviews deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book and its reviews deleted successfully"
 *       400:
 *         description: Invalid book ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid book ID"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book not found"
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticateToken, deleteBook);

module.exports = router;
