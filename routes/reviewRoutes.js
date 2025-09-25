const express = require("express");
const router = express.Router();
const {
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { authenticateToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Book reviews management
 */

/**
 * @swagger
 * /books/{bookId}/reviews:
 *   post:
 *     summary: Add a review to a book
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           example: 651f2b2c1234567890abcdef
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Amazing book!"
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Review already exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.post("/books/:bookId/reviews", authenticateToken, addReview);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 651f2b2c1234567890abcdef
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: "Updated my review"
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       403:
 *         description: Forbidden (not the owner)
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
router.put("/reviews/:id", authenticateToken, updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 651f2b2c1234567890abcdef
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       403:
 *         description: Forbidden (not the owner)
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/reviews/:id", authenticateToken, deleteReview);

module.exports = router;
