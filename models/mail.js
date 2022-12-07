const nodemailer = require("nodemailer");
var smtpPool = require('nodemailer-smtp-pool');
const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport(smtpPool({
      host: process.env.MAILHOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS,
      },
      maxConnections: 5,
      maxMessages: 10,
      rateLimit: 5
    }));
    var message = {
    from: 'test@smtp.codroid.host',
    to:email,
    subject:subject,
    headers: {
        'X-Laziness-level': 1000
    },
    text:text
    };
    transporter.sendMail(message, function(error, info) {
    if (error) {
        console.log('Error occurred');
        console.log(error.message);
        return;
    }
    console.log('Server responded with "%s"', info.response);
    console.log("email sent sucessfully");
    });
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = sendEmail;