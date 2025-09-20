const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name'
    );
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name,
             AVG(r.rating) as average_rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
      WHERE p.is_active = TRUE
    `;
    
    const params = [];
    
    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' GROUP BY p.id ORDER BY p.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [products] = await pool.execute(query, params);
    
    // Get variants for each product
    for (let product of products) {
      const [variants] = await pool.execute(
        'SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE ORDER BY variant_type, price_modifier',
        [product.id]
      );
      
      product.variants = {
        size: variants.filter(v => v.variant_type === 'size'),
        milk: variants.filter(v => v.variant_type === 'milk'),
        extra: variants.filter(v => v.variant_type === 'extra')
      };
      
      product.average_rating = product.average_rating ? parseFloat(product.average_rating) : 0;
      product.review_count = parseInt(product.review_count) || 0;
    }
    
    res.json(products);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name,
              AVG(r.rating) as average_rating,
              COUNT(r.id) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
       WHERE p.id = ? AND p.is_active = TRUE
       GROUP BY p.id`,
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = products[0];
    
    // Get variants
    const [variants] = await pool.execute(
      'SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE ORDER BY variant_type, price_modifier',
      [productId]
    );
    
    product.variants = {
      size: variants.filter(v => v.variant_type === 'size'),
      milk: variants.filter(v => v.variant_type === 'milk'),
      extra: variants.filter(v => v.variant_type === 'extra')
    };
    
    // Get reviews
    const [reviews] = await pool.execute(
      `SELECT r.*, u.username 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = TRUE
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [productId]
    );
    
    product.reviews = reviews;
    product.average_rating = product.average_rating ? parseFloat(product.average_rating) : 0;
    product.review_count = parseInt(product.review_count) || 0;
    
    res.json(product);
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured/popular products
router.get('/featured/popular', async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name,
              AVG(r.rating) as average_rating,
              COUNT(r.id) as review_count,
              COUNT(oi.id) as order_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
       LEFT JOIN order_items oi ON p.id = oi.product_id
       WHERE p.is_active = TRUE
       GROUP BY p.id
       ORDER BY order_count DESC, average_rating DESC
       LIMIT 8`
    );
    
    for (let product of products) {
      product.average_rating = product.average_rating ? parseFloat(product.average_rating) : 0;
      product.review_count = parseInt(product.review_count) || 0;
    }
    
    res.json(products);
  } catch (error) {
    console.error('Featured products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get personalized recommendations for user
router.get('/recommendations/personal', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's order history to find preferences
    const [userOrders] = await pool.execute(
      `SELECT DISTINCT oi.product_id, p.category_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?`,
      [userId]
    );
    
    if (userOrders.length === 0) {
      // If no order history, return popular products
      return res.redirect('/api/products/featured/popular');
    }
    
    const categoryIds = [...new Set(userOrders.map(order => order.category_id))];
    const productIds = userOrders.map(order => order.product_id);
    
    // Find similar products in same categories, excluding already ordered
    const placeholders = categoryIds.map(() => '?').join(',');
    const excludePlaceholders = productIds.map(() => '?').join(',');
    
    const [recommendations] = await pool.execute(
      `SELECT p.*, c.name as category_name,
              AVG(r.rating) as average_rating,
              COUNT(r.id) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
       WHERE p.is_active = TRUE 
       AND p.category_id IN (${placeholders})
       ${productIds.length > 0 ? `AND p.id NOT IN (${excludePlaceholders})` : ''}
       GROUP BY p.id
       ORDER BY average_rating DESC, RAND()
       LIMIT 6`,
      [...categoryIds, ...productIds]
    );
    
    for (let product of recommendations) {
      product.average_rating = product.average_rating ? parseFloat(product.average_rating) : 0;
      product.review_count = parseInt(product.review_count) || 0;
    }
    
    res.json(recommendations);
  } catch (error) {
    console.error('Personal recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create product
router.post('/', authenticateToken, requireAdmin, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('base_price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category required'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Valid stock quantity required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, base_price, category_id, image_url, stock_quantity } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO products (name, description, base_price, category_id, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, base_price, category_id, image_url || null, stock_quantity]
    );

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update product
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, base_price, category_id, image_url, stock_quantity, is_active } = req.body;

    await pool.execute(
      `UPDATE products SET 
       name = COALESCE(?, name),
       description = COALESCE(?, description),
       base_price = COALESCE(?, base_price),
       category_id = COALESCE(?, category_id),
       image_url = COALESCE(?, image_url),
       stock_quantity = COALESCE(?, stock_quantity),
       is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, description, base_price, category_id, image_url, stock_quantity, is_active, productId]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete product
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    await pool.execute(
      'UPDATE products SET is_active = FALSE WHERE id = ?',
      [productId]
    );

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
