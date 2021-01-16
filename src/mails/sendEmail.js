'use strict';
const nodemailer = require('nodemailer');
// const smtpTransport = require('nodemailer-smtp-transport');
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: 'pulse575@gmail.com',
    pass: 'pqiieofuwdrrlewl'
  }
});

class SendEmail {
// async..await is not allowed in global scope, must use a wrapper
  async sendMail(email, msg) {
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
    return true;
  }
  async sendOrderConfirmation(email, orderid = 0, date) {
    let mailOptions = {
      from: 'pulse575@gmail.com',
      to: email,
      subject: 'Panaache Order Confirmation',
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width">
        
        <!-- For development, pass document through inliner -->
        <style type="text/css">
        @import url('https://fonts.googleapis.com/css?family=Open+Sans');
        
        * {
          margin: 0;
          padding: 0;
          font-size: 100%;
          font-family: "Open Sans", Helvetica, Arial, sans-serif;
          line-height: 1.65;
        }
        
        img {
          max-width: 100%;
          margin: 0 auto;
          display: block;
        }
        
        body, .body-wrap {
          width: 97% !important;
          margin: 0 auto;
          height: 100%;
          background: #efefef;
          -webkit-font-smoothing: antialiased;
          -webkit-text-size-adjust: none;
        }
        
        a {
          color: #3ab795;
          text-decoration: none;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-left {
          text-align: left;
        }
        
        .button a {
          display: inline-block;
          color: #ffffff;
          background: #3ab795;
          border: 2px solid #3ab795;
          padding: 9px 20px 10px;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: normal;
        }
          
        .highlight {
          font-size: 22px;
          font-weight: bold;
        }
        
        h1, h2, h3, h4, h5, h6 {
          margin-bottom: 20px;
          line-height: 1.25;
        }
        
        h1 {
          font-size: 32px;
        }
        
        h2 {
          font-size: 28px;
        }
        
        h3 {
          font-size: 24px;
        }
        
        h4 {
          font-size: 20px;
        }
        
        h5 {
          font-size: 16px;
        }
        
        p, ul, ol {
          font-size: 14px;
          font-weight: normal;
          margin-bottom: 20px;
        }
        
        p.footnote {
          font-size: 10px;
          margin-top: 5px;
        }
        
        .container {
          display: block !important;
          clear: both !important;
          margin: 20px auto 0 !important;
          max-width: 580px !important;
        }
        
        .container table {
          width: 100% !important;
          border-collapse: collapse;
        }
        
        .container .preheader {
          font-size: 12px;
          padding: 5px 5px 5px 5px;
          color: #adadad;
          text-align: center;
        }
        
        .container .masthead {
          padding: 80px 0;
          background: #2a333b;
          color: white;
          background-repeat: no-repeat;
          background-position: center 15px;
          border-radius: 10px 10px 0 0;
        }
        
        .container .masthead h1 {
          margin: 0 auto !important;
          max-width: 90%;
        }
        
        .container .content {
          background: white;
          padding: 20px 20px 0 20px;
        }
        
        .container .content.footer {
          background: none; 
          padding-top: 0;
        }
        
        .container .content.footer p {
          margin-bottom: 0;
          color: #888;
          text-align: center;
          font-size: 12px;
        }
        
        .container .content.footer a {
          color: #888;
          text-decoration: none;
          font-weight: bold;
         }
         .myOrder {
           background-color: #4bb543;
           border: 0;
           border-radius: 5px;
           text-decoration: none;
           padding: 5%;
           color: white
         }
        </style>
        </head>
        
        
        <body style="width:97% !important;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;height:100%;background-color:#efefef;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;">
        
        <table class="body-wrap" style="width:97% !important;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;height:100%;background-color:#efefef;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;">
          <tr>
            <td class="container" style="display:block !important;clear:both !important;margin-top:20px !important;margin-bottom:0 !important;margin-right:auto !important;margin-left:auto !important;max-width:580px !important;">
        
        
        <!-- Message start -->
              <table style="width:100% !important;border-collapse:collapse;">
                <tr>
                            <td class="preheader" style="font-size: 10px;color:#adadad;text-align:center; padding:5px;">This is your order confirmation.</td>
                </tr>
                <tr>
                            <td align="center" class="masthead" style="padding-top:80px;padding-bottom:80px;padding-right:0;padding-left:0;background-color:#2a333b;background-repeat:no-repeat;background-position:center 1px;background-attachment:scroll;color:white;border-radius:10px 10px 0 0;">
                   <img src="https://s3.ap-south-1.amazonaws.com/www.panaache.in/img/fullLogo.a9987df4.png"> 
                   <!-- <h1 style="line-height:1.25;font-size:32px;margin-top:0 !important;margin-bottom:0 !important;margin-right:auto !important;margin-left:auto !important;max-width:90%;">Order Confirmation</h1> -->
                  </td>
                </tr>
                <tr>
                  <td class="content" style="background-color:white;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;padding-top:20px;padding-bottom:0;padding-right:20px;padding-left:20px;">
                    <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">Hello,</p>
                    
                    <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">Thank you for placing and order with us. Your order is being processed. Please keep this mail for further reference.</p>
        
        <p style="font-size:18px;font-weight:bold;margin-bottom:20px;">ORDER INFORMATION</p>
        
        <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">Order Date: ${date}<br>Order ID: ${orderid}<br>
        <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">For more details on your order please click on the following button</a>.</p><br>
        <a href="https://panaache.in/myOrders" class="myOrder">My Orders</a><br>
        <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">For any queries please write a mail to writeandmailtous@gmail.com</a>.</p>
        <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">This is an automatically generated email. please do not reply to this email</p>
        
        <!-- signature begin -->
        <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">Thanks,</p>
        <p style="font-size:14px;font-weight:normal;margin-bottom:20px;"><b>panaache.in</b></p>
        <!-- <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">Get help: <a href="https://help.hover.com/hc/en-us" style="color:#3ab795;text-decoration:none;">https://help.hover.com/hc/en-us</a><br>
        What's happening at Hover: <a href="https://www.hover.com/blog/" style="color:#3ab795;text-decoration:none;">https://www.hover.com/blog/</a><br>
        Hover is a service of Tucows, an ICANN accredited registrar since 1999.</p> -->
        </td>
        </tr>
        </table>
        <!-- body end -->
        </td>
        </tr>
        
        <!-- footer begin -->
        <tr>
        <td class="container" style="display:block !important;clear:both !important;margin-top:20px !important;margin-bottom:0 !important;margin-right:auto !important;margin-left:auto !important;max-width:580px !important;">
        <table style="width:100% !important;border-collapse:collapse;">
        <tr>
        <td class="content footer" align="center" style="background-color:#efefef;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;padding-top:20px;padding-bottom:0;padding-right:20px;padding-left:20px;">
        <p style="font-size:14px;font-weight:normal;margin-bottom:20px;">You were sent this email because you are a customer of <a href="">Panaache.com</a>.<br>
        Mailing address: Mahaveer Colong, Gadag<br>
        Email: <a href="mailto:help@panaache.com" style="color:#3ab795;text-decoration:none;">help@panaache.com</a></p>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <!-- footer end -->
        
        </table>
        </body>
        </html>`
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
    return true;
  }
}
module.exports = SendEmail;
