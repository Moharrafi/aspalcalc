import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword, createToken, AUTH_COOKIE_NAME, hashPassword } from '@/lib/auth';

async function ensureSeedUsers() {
  try {
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

    // 1. Admin account
    const adminHash = await hashPassword('admin123');
    await pool.query(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES ('admin', 'admin@bitucalc.com', ?, 'Admin', 'admin')
      ON DUPLICATE KEY UPDATE name = 'Admin', password_hash = ?
    `, [adminHash, adminHash]);

    // 2. Reseller Pa Jaja account
    const jajaHash = await hashPassword('jaja123');
    await pool.query(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES ('jaja', 'jaja@bitucalc.com', ?, 'Pa Jaja', 'reseller')
      ON DUPLICATE KEY UPDATE name = 'Pa Jaja', password_hash = ?
    `, [jajaHash, jajaHash]);
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeedUsers();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/ID dan password wajib diisi' },
        { status: 400 }
      );
    }

    const inputClean = email.trim();

    const [rows]: any = await pool.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(id) = LOWER(?)',
      [inputClean, inputClean]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Email/ID atau password tidak valid' },
        { status: 401 }
      );
    }

    const user = rows[0];
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email/ID atau password tidak valid' },
        { status: 401 }
      );
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'reseller'
    };

    const token = await createToken(userPayload);

    const response = NextResponse.json({
      success: true,
      user: userPayload
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
