const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'duykhanhit.hp@gmail.com',
      pass: 'duykhanh22'
    }
  });

  const message = {
    from: 'Duy Khánh - duykhanhit.hp@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  const info = await transporter.sendMail(message);
}

module.exports = sendMail;