const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDb() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      ssl: {
        rejectUnauthorized: false // Common for quick cloud DB setups
      }
    });

    console.log('Creating table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(36) PRIMARY KEY,
        date DATE NOT NULL,
        type ENUM('bitumax', 'hijau', 'hitam') NOT NULL,
        weight DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        totalPrice DECIMAL(15, 2) NOT NULL,
        totalCost DECIMAL(15, 2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "sales" created successfully or already exists.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        date DATE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        note VARCHAR(255) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "payments" created successfully or already exists.');
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
  }
}

initDb();
