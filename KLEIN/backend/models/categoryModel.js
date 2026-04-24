const pool = require('../config/db');

class Category {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { name, description } = data;
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  }
}

module.exports = Category;
