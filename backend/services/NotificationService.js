const nodemailer = require('nodemailer');

// Setup your email transporter (e.g., Gmail, SendGrid, Mailtrap)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNotification = async (type, metadata, data) => {
  if (type === 'email') {
    let targetEmail = metadata.assignee_email;
    if (targetEmail && targetEmail.startsWith('$')) {
        const varName = targetEmail.substring(1);
        targetEmail = data[varName];
    }

    if (!process.env.EMAIL_HOST) {
        console.log("Mocking email send (no SMTP configured): sent to", targetEmail);
        return Promise.resolve(true);
    }
    const mailOptions = {
      from: '"Workflow Engine" <no-reply@your-saas.com>',
      to: targetEmail,
      subject: `Action Required: ${metadata.subject || 'Workflow Update'}`,
      html: `<p>A workflow requires your attention.</p>
             <p><strong>Details:</strong> ${JSON.stringify(data)}</p>
             <a href="http://localhost:3000/admin">View in Inbox</a>`
    };

    return transporter.sendMail(mailOptions);
  }

  if (type === 'webhook') {
    // Example for Slack/Discord
    return fetch(metadata.webhook_url, {
      method: 'POST',
      body: JSON.stringify({ text: `Workflow Alert: ${metadata.message}` }),
    });
  }
};

module.exports = { sendNotification };