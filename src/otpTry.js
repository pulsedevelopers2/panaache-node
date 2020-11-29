const https = require('https');

function sendOtp() {
  let username = 'shreyasbafna';
  let password = 'Shreyas@123';

  let postData = JSON.stringify({
    to: ['+919611466394'],
    body: 'Hello World!'
  });

  let options = {
    hostname: 'api.bulksms.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
      'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
    }
  };

  let req = https.request(options, resp => {
    console.log('statusCode:', resp.statusCode);
    let data = '';
    resp.on('data', chunk => {
      data += chunk;
    });
    resp.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', e => {
    console.error(e);
  });

  req.write(postData);
  req.end();
}
module.exports = { sendOtp };
