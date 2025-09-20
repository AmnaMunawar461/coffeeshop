const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [favorites] = await pool.execute(
      `SELECT f.*, p.name, p.description, p.base_price, p.image_url,
              c.name as category_name,
              AVG(r.rating) as average_rating,
              COUNT(r.id) as review_count
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
       WHERE f.user_id = ? AND p.is_active = TRUE
       GROUP BY f.id
       ORDER BY f.created_at DESC`,
      [userId]
    );

    for (let favorite of favorites) {
      favorite.average_rating = favorite.average_rating ? parseFloat(favorite.average_rating) : 0;
      favorite.review_count = parseInt(favorite.review_count) || 0;
    }

    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add product to favorites
router.post('/add', authenticateToken, [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if already in favorites
    const [existingFavorites] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existingFavorites.length > 0) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }

    // Add to favorites
    await pool.execute(
      'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
      [userId, product_id]
    );

    res.status(201).json({ message: 'Product added to favorites successfully' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove product from favorites
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Product removed from favorites successfully' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if product is in user's favorites
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const [favorites] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    res.json({ isFavorite: favorites.length > 0 });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
