const pool = require('../config/db');

class Order {
  static async create(userId, totalAmount, items) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create the order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
        [userId, totalAmount]
      );
      const orderId = orderResult.insertId;

      // Create order items
      for (let item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );

        // Deduct stock
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Create initial tracking entry
      await connection.query(
        'INSERT INTO order_tracking (order_id, status) VALUES (?, ?)',
        [orderId, 'processing']
      );

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return null;

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    orders[0].items = items;
    return orders[0];
  }

  static async updateStatus(id, status, paymentStatus) {
    let query = 'UPDATE orders SET ';
    const params = [];
    if (status) {
      query += 'status = ? ';
      params.push(status);
    }
    if (paymentStatus) {
      if (status) query += ', ';
      query += 'payment_status = ? ';
      params.push(paymentStatus);
    }
    query += 'WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    return result.affectedRows;
  }
}

module.exports = Order;
