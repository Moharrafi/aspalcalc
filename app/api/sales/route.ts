import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, type, weight, quantity, totalPrice, totalCost, createdAt FROM sales ORDER BY date DESC, createdAt DESC`);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, date, type, weight, quantity, totalPrice, totalCost } = body;

    const [result] = await pool.query(
      'INSERT INTO sales (id, date, type, weight, quantity, totalPrice, totalCost) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, date, type, weight, quantity, totalPrice, totalCost]
    );

    return NextResponse.json({ message: 'Sale recorded', id });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await pool.query('DELETE FROM sales WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Sale deleted' });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, date, type, weight, quantity, totalPrice, totalCost } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await pool.query(
      'UPDATE sales SET date = ?, type = ?, weight = ?, quantity = ?, totalPrice = ?, totalCost = ? WHERE id = ?',
      [date, type, weight, quantity, totalPrice, totalCost, id]
    );

    return NextResponse.json({ message: 'Sale updated', id });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
