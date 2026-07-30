import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Create users table if not existing
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'reseller') NOT NULL DEFAULT 'reseller',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Admin account
    const adminHash = await hashPassword('admin123');
    await pool.query(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES ('admin', 'admin@bitucalc.com', ?, 'Admin', 'admin')
      ON DUPLICATE KEY UPDATE name = 'Admin', password_hash = ?
    `, [adminHash, adminHash]);

    // 3. Reseller Pa Jaja account
    const jajaHash = await hashPassword('jaja123');
    await pool.query(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES ('jaja', 'jaja@bitucalc.com', ?, 'Pa Jaja', 'reseller')
      ON DUPLICATE KEY UPDATE name = 'Pa Jaja', password_hash = ?
    `, [jajaHash, jajaHash]);

    return NextResponse.json({
      success: true,
      message: 'Database users table updated with Admin and Reseller Pa Jaja.'
    });
  } catch (error: any) {
    console.error('Init Auth Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
