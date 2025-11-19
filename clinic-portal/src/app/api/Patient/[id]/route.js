import { NextResponse } from 'next/server';
import { store } from '../../_dev/store';

export async function GET(_req, { params }) {
  const id = Number(params.id);
  const p = store.patients.find((x) => x.id === id);
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(p);
}

export async function PUT(req, { params }) {
  const id = Number(params.id);
  const i = store.patients.findIndex((x) => x.id === id);
  if (i === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const updated = { ...store.patients[i], ...body, id, updatedAt: new Date().toISOString() };
  store.patients[i] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(_req, { params }) {
  const id = Number(params.id);
  const before = store.patients.length;
  store.patients = store.patients.filter((x) => x.id !== id);
  if (store.patients.length === before) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
