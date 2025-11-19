import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { to, body } = await req.json();
    if (!to || !body) return NextResponse.json({ error: 'Missing to/body' }, { status: 400 });

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    if (!sid || !token || !from) {
      console.warn('Twilio env not set; simulating send.');
      return NextResponse.json({ ok: true, simulated: true });
    }

    const twilio = (await import('twilio')).default;
    const client = twilio(sid, token);
    const msg = await client.messages.create({ to, from, body });
    return NextResponse.json({ ok: true, sid: msg.sid });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
