const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    // Connect to MySQL server without database selected to create DB if not exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('Connected to MySQL server.');

    // Read and execute schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, '../config/schema.sql'), 'utf8');
    const statements = schemaSql.split(';').filter(stmt => stmt.trim() !== '');

    for (let statement of statements) {
      await connection.query(statement);
    }
    console.log('Database and tables created from schema.sql.');

    // Switch to database
    await connection.changeUser({ database: process.env.DB_NAME });

    // Clear existing data
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE order_items');
    await connection.query('TRUNCATE TABLE order_tracking');
    await connection.query('TRUNCATE TABLE payments');
    await connection.query('TRUNCATE TABLE orders');
    await connection.query('TRUNCATE TABLE cart_items');
    await connection.query('TRUNCATE TABLE carts');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE categories');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared existing data.');

    // Seed Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await connection.query(
      `INSERT INTO users (full_name, email, phone, password, address, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Admin User', 'admin@klein.com', '0780000000', hashedPassword, 'Kigali, Rwanda', 'admin']
    );

    // Seed Categories
    const [cat1] = await connection.query(`INSERT INTO categories (name, description) VALUES ('Clothes', 'Men and Women Clothing')`);
    const [cat2] = await connection.query(`INSERT INTO categories (name, description) VALUES ('Shoes', 'Footwear for all')`);

    // Seed Products
    await connection.query(
      `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Classic T-Shirt', '100% Cotton T-Shirt', 15.99, 100, cat1.insertId, 'http://example.com/tshirt.jpg']
    );
    await connection.query(
      `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Running Sneakers', 'Comfortable running shoes', 45.00, 50, cat2.insertId, 'http://example.com/sneakers.jpg']
    );

    console.log('Sample data seeded successfully.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
