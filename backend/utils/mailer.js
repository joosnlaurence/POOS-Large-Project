import sgMail from '@sendgrid/mail';

// Set API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendMail({ to, subject, html }) {
  const msg = {
    to,
    from: 'largeprojectmailer.test@gmail.com',
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent successfully to:', to);
  } catch (error) {
    console.error('❌ SendGrid error:', error?.response?.body || error);
    throw error;
  }
}
