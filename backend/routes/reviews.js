const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const [reviews] = await pool.execute(
      `SELECT r.*, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = TRUE
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [productId, parseInt(limit), parseInt(offset)]
    );

    // Get average rating and count
    const [stats] = await pool.execute(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
       FROM reviews
       WHERE product_id = ? AND is_approved = TRUE`,
      [productId]
    );

    res.json({
      reviews,
      stats: {
        average_rating: stats[0].average_rating ? parseFloat(stats[0].average_rating) : 0,
        total_reviews: parseInt(stats[0].total_reviews) || 0
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create review
router.post('/create', authenticateToken, [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const [existingReviews] = await pool.execute(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [product_id, userId]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Check if user has purchased this product
    const [purchases] = await pool.execute(
      `SELECT oi.id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'completed'`,
      [userId, product_id]
    );

    if (purchases.length === 0) {
      return res.status(400).json({ error: 'You can only review products you have purchased' });
    }

    // Create review
    const [result] = await pool.execute(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [product_id, userId, rating, comment || null]
    );

    res.status(201).json({
      message: 'Review submitted successfully. It will be visible after approval.',
      reviewId: result.insertId
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update review
router.put('/:reviewId', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check if review belongs to user
    const [reviews] = await pool.execute(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update review
    await pool.execute(
      'UPDATE reviews SET rating = COALESCE(?, rating), comment = COALESCE(?, comment), is_approved = FALSE WHERE id = ?',
      [rating, comment, reviewId]
    );

    res.json({ message: 'Review updated successfully. It will be visible after approval.' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete review
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all reviews (pending approval)
router.get('/admin/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, p.name as product_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN products p ON r.product_id = p.id
       WHERE r.is_approved = FALSE
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json(reviews);
  } catch (error) {
    console.error('Admin get pending reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve/reject review
router.put('/admin/:reviewId/approve', authenticateToken, requireAdmin, [
  body('is_approved').isBoolean().withMessage('Approval status required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewId } = req.params;
    const { is_approved } = req.body;

    await pool.execute(
      'UPDATE reviews SET is_approved = ? WHERE id = ?',
      [is_approved, reviewId]
    );

    res.json({ 
      message: `Review ${is_approved ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error('Admin approve review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const [reviews] = await pool.execute(
      `SELECT r.*, p.name as product_name, p.image_url as product_image
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json(reviews);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
