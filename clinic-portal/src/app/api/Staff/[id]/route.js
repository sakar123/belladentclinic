import { NextResponse } from 'next/server';
import { store } from '../../_dev/store';

function notProd() {
  return process.env.NODE_ENV !== 'production';
}

export async function GET(_req, { params }) {
  if (!notProd()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const id = Number(params.id);
  const item = store.staff.find((s) => Number(s.id) === id);
  if (!item) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req, { params }) {
  if (!notProd()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const id = Number(params.id);
  const idx = store.staff.findIndex((s) => Number(s.id) === id);
  if (idx === -1) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
  const body = await req.json();
  const current = store.staff[idx] || {};
  const now = new Date().toISOString();
  const updated = {
    ...current,
    ...body,
    person: { ...(current.person || {}), ...(body.person || {}) },
    updatedAt: now,
  };
  store.staff[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(_req, { params }) {
  if (!notProd()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const id = Number(params.id);
  const idx = store.staff.findIndex((s) => Number(s.id) === id);
  if (idx === -1) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
  const [removed] = store.staff.splice(idx, 1);
  return NextResponse.json(removed);
}

