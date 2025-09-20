const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create order from cart
router.post('/create', authenticateToken, [
  body('payment_method').isIn(['card', 'cash']).withMessage('Valid payment method required'),
  body('payment_details').optional().isObject().withMessage('Payment details must be an object')
], async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { payment_method, payment_details, notes } = req.body;
    const userId = req.user.id;

    // Get cart items
    const [cartItems] = await connection.execute(
      `SELECT ci.*, p.name, p.base_price, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND p.is_active = TRUE`,
      [userId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total and validate stock
    let subtotal = 0;
    const orderItems = [];

    for (let item of cartItems) {
      let unitPrice = parseFloat(item.base_price);
      
      // Check stock
      if (item.stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.name}. Available: ${item.stock_quantity}, Requested: ${item.quantity}` 
        });
      }

      // Calculate price with customizations
      if (item.customizations) {
        const customizations = JSON.parse(item.customizations);
        
        if (customizations.variants && customizations.variants.length > 0) {
          const variantIds = customizations.variants.map(v => v.id);
          const placeholders = variantIds.map(() => '?').join(',');
          
          const [variants] = await connection.execute(
            `SELECT price_modifier FROM product_variants WHERE id IN (${placeholders})`,
            variantIds
          );
          
          unitPrice += variants.reduce((sum, variant) => sum + parseFloat(variant.price_modifier), 0);
        }
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        customizations: item.customizations
      });
    }

    const taxAmount = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + taxAmount;

    // Mock payment processing
    let paymentStatus = 'completed';
    if (payment_method === 'card') {
      // Simulate payment processing
      if (payment_details && payment_details.card_number === '4000000000000002') {
        paymentStatus = 'failed';
      }
    }

    if (paymentStatus === 'failed') {
      await connection.rollback();
      return res.status(400).json({ error: 'Payment failed. Please try again.' });
    }

    // Create order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, tax_amount, payment_method, payment_status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, totalAmount, taxAmount, payment_method, paymentStatus, notes || null]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (let item of orderItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, customizations) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.unit_price, item.customizations]
      );

      // Update product stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await connection.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    // Update order status
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [paymentStatus === 'completed' ? 'processing' : 'pending', orderId]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      totalAmount,
      paymentStatus
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const [orders] = await pool.execute(
      `SELECT o.*, COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order details
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Get order
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [orderItems] = await pool.execute(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    order.items = orderItems;

    res.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder (add order items to cart)
router.post('/:orderId/reorder', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Verify order belongs to user
    const [orders] = await pool.execute(
      'SELECT id FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const [orderItems] = await pool.execute(
      `SELECT oi.product_id, oi.quantity, oi.customizations, p.stock_quantity
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ? AND p.is_active = TRUE`,
      [orderId]
    );

    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'No available items to reorder' });
    }

    // Add items to cart
    for (let item of orderItems) {
      // Check stock
      if (item.stock_quantity >= item.quantity) {
        // Check if item already exists in cart
        const [existingItems] = await pool.execute(
          'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND customizations = ?',
          [userId, item.product_id, item.customizations]
        );

        if (existingItems.length > 0) {
          // Update quantity
          const newQuantity = existingItems[0].quantity + item.quantity;
          if (item.stock_quantity >= newQuantity) {
            await pool.execute(
              'UPDATE cart_items SET quantity = ? WHERE id = ?',
              [newQuantity, existingItems[0].id]
            );
          }
        } else {
          // Add new item
          await pool.execute(
            'INSERT INTO cart_items (user_id, product_id, quantity, customizations) VALUES (?, ?, ?, ?)',
            [userId, item.product_id, item.quantity, item.customizations]
          );
        }
      }
    }

    res.json({ message: 'Items added to cart successfully' });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all orders
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT o.*, u.username, u.email, COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    
    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await pool.execute(query, params);

    res.json(orders);
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update order status
router.put('/admin/:orderId/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'processing', 'completed', 'cancelled']).withMessage('Valid status required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
