const pool = require('../config/db');

class User {
  static async create(userData) {
    const { full_name, email, phone, password, address, role } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, phone, password, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, phone, password, address, role || 'user']
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updateProfile(id, updateData) {
    const { full_name, phone, address, password } = updateData;
    let query = 'UPDATE users SET full_name = ?, phone = ?, address = ?';
    const params = [full_name, phone, address];

    if (password) {
      query += ', password = ?';
      params.push(password);
    }
    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    return result.affectedRows;
  }
}

module.exports = User;
