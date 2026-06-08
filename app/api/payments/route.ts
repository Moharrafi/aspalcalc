import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function ensurePaymentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(36) PRIMARY KEY,
      date DATE NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      note VARCHAR(255) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function GET() {
  try {
    await ensurePaymentsTable();
    const [rows] = await pool.query(`
      SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, amount, note, createdAt
      FROM payments
      ORDER BY date DESC, createdAt DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensurePaymentsTable();
    const body = await request.json();
    const { id, date, amount, note } = body;

    if (!id || !date || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO payments (id, date, amount, note) VALUES (?, ?, ?, ?)',
      [id, date, amount, note || null]
    );

    return NextResponse.json({ message: 'Payment recorded', id });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensurePaymentsTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await pool.query('DELETE FROM payments WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Payment deleted' });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
