const pool = require('../config/db');

class Cart {
  static async findOrCreateByUserId(userId) {
    let [rows] = await pool.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      return result.insertId;
    }
    return rows[0].id;
  }

  static async getItems(cartId) {
    const [rows] = await pool.query(
      `SELECT ci.id, ci.product_id, p.name, p.image_url, ci.quantity, ci.price 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
    return rows;
  }

  static async addItem(cartId, productId, quantity, price) {
    // Check if item already exists in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, existing[0].id]);
      return existing[0].id;
    } else {
      // Insert new item
      const [result] = await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [cartId, productId, quantity, price]
      );
      return result.insertId;
    }
  }

  static async updateItemQuantity(cartId, productId, quantity) {
    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
      [quantity, cartId, productId]
    );
    return result.affectedRows;
  }

  static async removeItem(cartId, productId) {
    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    return result.affectedRows;
  }
  
  static async clearCart(cartId) {
      await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  }
}

module.exports = Cart;
