const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [cartItems] = await pool.execute(
      `SELECT ci.*, p.name, p.base_price, p.image_url, p.stock_quantity,
              c.name as category_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE ci.user_id = ? AND p.is_active = TRUE
       ORDER BY ci.created_at DESC`,
      [userId]
    );
    
    // Calculate total price for each item including customizations
    for (let item of cartItems) {
      let totalPrice = parseFloat(item.base_price);
      
      if (item.customizations) {
        const customizations = JSON.parse(item.customizations);
        
        // Get variant price modifiers
        if (customizations.variants && customizations.variants.length > 0) {
          const variantIds = customizations.variants.map(v => v.id);
          const placeholders = variantIds.map(() => '?').join(',');
          
          const [variants] = await pool.execute(
            `SELECT price_modifier FROM product_variants WHERE id IN (${placeholders})`,
            variantIds
          );
          
          totalPrice += variants.reduce((sum, variant) => sum + parseFloat(variant.price_modifier), 0);
        }
      }
      
      item.unit_price = totalPrice;
      item.total_price = totalPrice * item.quantity;
    }
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    res.json({
      items: cartItems,
      summary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity, customizations } = req.body;
    const userId = req.user.id;

    // Check if product exists and is active
    const [products] = await pool.execute(
      'SELECT id, stock_quantity FROM products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];

    // Check stock availability
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart with same customizations
    const customizationsJson = customizations ? JSON.stringify(customizations) : null;
    
    const [existingItems] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND customizations = ?',
      [userId, product_id, customizationsJson]
    );

    if (existingItems.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItems[0].quantity + quantity;
      
      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }

      await pool.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // Add new item to cart
      await pool.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity, customizations) VALUES (?, ?, ?, ?)',
        [userId, product_id, quantity, customizationsJson]
      );
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', authenticateToken, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Check if cart item belongs to user
    const [cartItems] = await pool.execute(
      `SELECT ci.id, ci.product_id, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND ci.user_id = ?`,
      [itemId, userId]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const cartItem = cartItems[0];

    // Check stock availability
    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, itemId]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear entire cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
