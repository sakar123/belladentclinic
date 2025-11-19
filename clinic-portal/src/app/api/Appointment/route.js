import { NextResponse } from 'next/server';
import { store } from '../_dev/store';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patient_id') || searchParams.get('patientId');
  const items = store.appointments;
  const filtered = patientId ? items.filter((a) => String(a.patientId) === String(patientId)) : items;
  return NextResponse.json(filtered);
}

