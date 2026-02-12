const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Please login to access cart' });
  }
  next();
}

// GET - Get all cart items for current user
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('Fetching cart for user:', req.session.user.id);
    
    const result = await pool.query(`
      SELECT 
        c.cart_id, c.quantity, c.created_at,
        b.book_id, b.title, b.author, b.price, b.image_url
      FROM cart_items c
      JOIN books b ON c.book_id = b.book_id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [req.session.user.id]);

    console.log(`Found ${result.rows.length} cart items`);
    res.json({ cartItems: result.rows });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST - Add item to cart
router.post('/', requireAuth, async (req, res) => {
  const { bookId, quantity = 1 } = req.body;

  console.log('Add to cart request:', { userId: req.session.user.id, bookId, quantity });

  if (!bookId) {
    return res.status(400).json({ error: 'Book ID required' });
  }

  try {
    // Check if item already in cart
    const existing = await pool.query(
      'SELECT cart_id, quantity FROM cart_items WHERE user_id = $1 AND book_id = $2',
      [req.session.user.id, bookId]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      const newQuantity = existing.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2',
        [newQuantity, existing.rows[0].cart_id]
      );
      console.log('Updated cart item quantity to', newQuantity);
      res.json({ message: 'Cart updated', cartId: existing.rows[0].cart_id });
    } else {
      // Insert new item
      const result = await pool.query(
        'INSERT INTO cart_items (user_id, book_id, quantity) VALUES ($1, $2, $3) RETURNING cart_id',
        [req.session.user.id, bookId, quantity]
      );
      console.log('Added new item to cart:', result.rows[0].cart_id);
      res.json({ message: 'Added to cart', cartId: result.rows[0].cart_id });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PUT - Update cart item quantity
router.put('/:cartId', requireAuth, async (req, res) => {
  const { cartId } = req.params;
  const { quantity } = req.body;

  console.log('📝 Update cart item:', { cartId, quantity });

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  try {
    await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND user_id = $3',
      [quantity, cartId, req.session.user.id]
    );
    console.log('Updated cart item');
    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE - Remove item from cart
router.delete('/:cartId', requireAuth, async (req, res) => {
  const { cartId } = req.params;

  console.log('Remove cart item:', cartId);

  try {
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND user_id = $2',
      [cartId, req.session.user.id]
    );
    console.log('Removed cart item');
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

module.exports = router;
