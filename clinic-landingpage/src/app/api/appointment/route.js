import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log(data);
    // validate data here (e.g., name, email, etc.)
    if (!data.fullName || !data.email || !data.phone ) {
      return new Response(JSON.stringify({ error: 'Name and email required' }), { status: 400 });
    }

    // Configure Nodemailer transporter with Mailtrap
    const transporter = nodemailer.createTransport({
      host: 'live.smtp.mailtrap.io',
      port: 587,
      auth: {
        user: 'api',
        pass: '1e4e5012a971c415f066afa4a373fc0f',
      },
    });

    // Compose email content
    const mailOptions = {
      from: '"Magic Elves" <hello@demomailtrap.co>',
      to: 'bedepaj562@jxbav.com',
      subject: 'New Appointment Booking',
      text: `
        New appointment booked:

        Name: ${data.name}
        Email: ${data.email}
        Phone: ${data.phone || 'N/A'}
        Date: ${data.date}
        Time: ${data.time}
        Message: ${data.message || 'N/A'}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Appointment booked successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error sending appointment email:', error);
    return new Response(JSON.stringify({ error: 'Failed to book appointment' }), { status: 500 });
  }
}
