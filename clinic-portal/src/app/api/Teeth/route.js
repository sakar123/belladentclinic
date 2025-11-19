import { NextResponse } from 'next/server';
import { store } from '../_dev/store';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patient_id') || searchParams.get('patientId');
  // For local dev, return an empty list or any stored teeth records
  const items = store.teeth;
  const filtered = patientId ? items.filter((t) => String(t.patientId) === String(patientId)) : items;
  return NextResponse.json(filtered);
}

