'use strict';
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(email, msg) {
  console.log('here');
  let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
      user: 'pulse575@gmail.com',
      pass: 'Pulse@123dev'
    }
  }));
  let mailOptions = {
    from: 'pulse575@gmail.com',
    to: email,
    subject: 'Panaache OTP Verification',
    html: `<h3>Verification Mail</h3><p>Your Panaache Verification Code is ${msg}</p>`
  };
  await new Promise(resolve => {
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        resolve();
      } else {
        console.log(`Email sent: ${info.response}`);
        resolve();
      }
    });
  });
  console.log('done');
  return true;
}
module.exports = { sendMail };
