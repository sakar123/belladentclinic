import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // 1. Basic validation
    if (!data.fullName || !data.email || !data.phone) {
      return new Response(JSON.stringify({ error: 'Full name, email, and phone are required.' }), { status: 400 });
    }

    // 2. Call the main ClinicApi backend
    const apiResponse = await fetch('http://localhost:5112/api/LandingPage/appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('Error from ClinicApi:', errorBody);
      throw new Error(`API request failed with status ${apiResponse.status}: ${errorBody}`);
    }

    const apiResult = await apiResponse.json();
    console.log('Successfully created appointment via ClinicApi:', apiResult);

    // 3. Send email notification (only after successful API call)
    const transporter = nodemailer.createTransport({
      host: 'live.smtp.mailtrap.io',
      port: 587,
      auth: {
        user: 'api',
        pass: '1e4e5012a971c415f066afa4a373fc0f',
      },
    });

    const mailOptions = {
      from: '"Clinic Appointments" <appointments@yourclinic.com>',
      to: 'recipient@example.com', // TODO: Change to a real recipient
      subject: 'New Appointment Request Received',
      text: `
        A new appointment request has been successfully created in the system.

        Name: ${data.fullName}
        Email: ${data.email}
        Phone: ${data.phone || 'N/A'}
        Requested Date: ${data.date}
        Requested Time: ${data.time}
        Message: ${data.message || 'N/A'}

        Appointment ID: ${apiResult.appointmentId}
      `,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Appointment request submitted successfully!' }), { status: 200 });

  } catch (error) {
    console.error('Error processing appointment request:', error);
    return new Response(JSON.stringify({ error: 'Failed to book appointment. Please try again later.' }), { status: 500 });
  }
}
