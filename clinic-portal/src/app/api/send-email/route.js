import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) return NextResponse.json({ error: 'Missing to/subject/html' }, { status: 400 });

    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.EMAIL_FROM || 'no-reply@clinic.example';

    if (!apiKey) {
      console.warn('SendGrid API key not set; simulating send.');
      return NextResponse.json({ ok: true, simulated: true });
    }

    const sgMail = (await import('@sendgrid/mail')).default;
    sgMail.setApiKey(apiKey);
    await sgMail.send({ to, from, subject, html });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
