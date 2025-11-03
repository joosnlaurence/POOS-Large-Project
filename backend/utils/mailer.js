import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,            // smtp.sendgrid.net or smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465
  auth: {
    user: process.env.SMTP_USER,          // SendGrid: "apikey" | Gmail: your full email
    pass: process.env.SMTP_PASS           // SendGrid: your API key | Gmail: app password
  }
});

export async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"My App" <no-reply@myapp.com>',
      to,
      subject,
      html
    });
    console.log('Yes Email Sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('No Email send error:', err);
    throw err;
  }
}
