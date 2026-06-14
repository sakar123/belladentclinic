import { NextResponse } from 'next/server';
import { store } from '../_dev/store';

export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(store.patients);
}

export async function POST(req) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const body = await req.json();
    const id = store.nextPatientId++;
    const now = new Date().toISOString();
    const patient = { id, createdAt: now, updatedAt: now, ...(body || {}) };
    store.patients.push(patient);
    return NextResponse.json(patient, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
