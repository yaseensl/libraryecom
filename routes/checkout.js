const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// POST - Create order from cart
router.post('/create-order', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Please login' });
  }

  const {
    shippingName,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingZip,
    cardNumber
  } = req.body;

  if (!shippingName || !shippingAddress || !shippingCity || !shippingState || !shippingZip || !cardNumber) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get cart items
    const cartResult = await client.query(`
      SELECT c.cart_id, c.book_id, c.quantity, b.price
      FROM cart_items c
      JOIN books b ON c.book_id = b.book_id
      WHERE c.user_id = $1
    `, [req.session.user.id]);

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    const subtotal = cartResult.rows.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    const tax = subtotal * 0.10; // 10% tax
    const totalAmount = subtotal + tax;

    // Store only last 4 digits of card
    const cardLast4 = cardNumber.slice(-4);

    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (
        user_id, total_amount, subtotal, tax,
        shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip,
        card_last_four, order_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed')
      RETURNING order_id
    `, [
      req.session.user.id,
      totalAmount.toFixed(2),
      subtotal.toFixed(2),
      tax.toFixed(2),
      shippingName,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      cardLast4
    ]);

    const orderId = orderResult.rows[0].order_id;

    // Create order items
    for (const item of cartResult.rows) {
      await client.query(`
        INSERT INTO order_items (order_id, book_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
      `, [orderId, item.book_id, item.quantity, item.price]);
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.session.user.id]);

    await client.query('COMMIT');

    res.json({
      message: 'Order created successfully',
      orderId,
      total: totalAmount.toFixed(2)
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
