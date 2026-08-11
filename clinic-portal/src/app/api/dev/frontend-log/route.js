import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_LOGS_ALLOW_PRODUCTION !== '1') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const entries = Array.isArray(payload?.entries) ? payload.entries : [payload].filter(Boolean);

  for (const entry of entries) {
    const level = safeLevel(entry?.level);
    const timestamp = entry?.timestamp || new Date().toISOString();
    const path = entry?.path || '';
    const args = Array.isArray(entry?.args) ? entry.args : [];
    const message = args.map(formatArg).join(' ');
    const prefix = `[frontend:${level}] ${timestamp} ${path}`;

    if (level === 'error') console.error(prefix, message);
    else if (level === 'warn') console.warn(prefix, message);
    else console.log(prefix, message);
  }

  return NextResponse.json({ ok: true });
}

function safeLevel(level) {
  return ['error', 'warn', 'info', 'log'].includes(level) ? level : 'log';
}

function formatArg(arg) {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}
