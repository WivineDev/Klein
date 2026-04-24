const pool = require('../config/db');

class Product {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByCategoryId(categoryId) {
    const [rows] = await pool.query('SELECT * FROM products WHERE category_id = ?', [categoryId]);
    return rows;
  }

  static async create(data) {
    const { name, description, price, stock_quantity, category_id, image_url } = data;
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock_quantity, category_id, image_url]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { name, description, price, stock_quantity, category_id, image_url } = data;
    const [result] = await pool.query(
      'UPDATE products SET name=?, description=?, price=?, stock_quantity=?, category_id=?, image_url=? WHERE id=?',
      [name, description, price, stock_quantity, category_id, image_url, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Product;
