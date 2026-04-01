import { NextResponse } from 'next/server';
import { store } from '../_dev/store';

export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(store.staff);
}

export async function POST(req) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const id = store.nextStaffId++;
  const now = new Date().toISOString();
  const staff = { id, createdAt: now, updatedAt: now, ...(body || {}) };
  store.staff.push(staff);
  return NextResponse.json(staff, { status: 201 });
}
