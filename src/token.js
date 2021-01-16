const Auth = require('./authutilities/authutilities');
const auth = new Auth();

class Token {
  getToken(body, data) {
    let result = auth.sendToken(body, auth.createKey(data));
    return Buffer.from(result).toString('base64');
  }
}
module.exports = Token;
