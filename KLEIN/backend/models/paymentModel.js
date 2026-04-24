const pool = require('../config/db');

class Payment {
  static async create(orderId, paymentMethod, amount, transactionRef) {
    const [result] = await pool.query(
      'INSERT INTO payments (order_id, payment_method, amount, transaction_ref) VALUES (?, ?, ?, ?)',
      [orderId, paymentMethod, amount, transactionRef]
    );
    return result.insertId;
  }
}

module.exports = Payment;
