import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY
    
);

async function testResend() {
  try {
    const result = await resend.emails.send({
      from: 'orders@stllhaus.co', // or your verified sender
      to: ['stllhausco@gmail.com'], // your real inbox
      subject: 'hello world',
      html: '<p>it works!</p>',
    });
    console.log('Email sent:', result);
  } catch (err) {
    console.error('Resend error:', err);
  }
}

testResend();
