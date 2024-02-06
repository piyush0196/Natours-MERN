const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create a Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  // Define Email options
  const mailOptions = {
    from: "Piyush <piyushkhodre1996@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // Send email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
