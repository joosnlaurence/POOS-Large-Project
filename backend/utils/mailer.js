import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'largeprojectmailer.test@gmail.com',
    pass: 'xumjwtqpiiksqdah'  // your Gmail app password
  }
});

export async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: '"Large Project" <largeprojectmailer.test@gmail.com>',
      to,
      subject,
      html
    });
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Email send error:', err);
    throw err;
  }
}
