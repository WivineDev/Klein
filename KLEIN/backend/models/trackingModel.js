const pool = require('../config/db');

class Tracking {
  static async findByOrderId(orderId) {
    const [rows] = await pool.query(
      'SELECT * FROM order_tracking WHERE order_id = ? ORDER BY updated_at DESC',
      [orderId]
    );
    return rows;
  }

  static async addUpdate(orderId, status, location) {
    const [result] = await pool.query(
      'INSERT INTO order_tracking (order_id, status, location) VALUES (?, ?, ?)',
      [orderId, status, location]
    );
    return result.insertId;
  }
}

module.exports = Tracking;
