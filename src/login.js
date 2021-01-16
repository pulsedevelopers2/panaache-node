const Auth = require('./authutilities/authutilities');
const Token = require('./token');
let { sendMail } = require('./sendmail');
const token = new Token();
const auth = new Auth();
let axios = require('axios');
// let http = require('http');
let AuthDB = require('./authutilities/authDB');
let authDB = new AuthDB();

class Login {
  async signUp(req) {
    let userBody = auth.decryptBodyJSON(req.headers.signup);
    let validate = this.validUserBody(userBody);// validate Body
    if (!validate) {
      return 'Error';
    }
    let emailauth = await auth.emailCheck(userBody); // call AuthUtilities EmailCheck
    if (emailauth === null) {
      let otp = await Math.floor(1000 + (9999 - 1000) * Math.random());
      let motp = await Math.floor(1000 + (9999 - 1000) * Math.random());
      await auth.addNewUser(userBody, otp, motp); // Add User
      let user_details = await auth.getUser(userBody.email);
      await Promise.all([this.sendMsgOtp(user_details.phone, motp), sendMail(userBody.email, otp)]);
      return 'otpSent';
    }
    return 'userExist';
  }

  async verifyOtp(req, res) {
    let userBody = auth.decryptBodyJSON(req.headers.verifyotp);
    let result = await auth.otpCheck(userBody);
    if (!result) {
      res.append('error', 'error');
      return 'error';
    }
    return token.getToken(userBody, req.headers);
  }
  async resend(req) {
    let userBody = auth.decryptBodyJSON(req.headers.resendotp);
    let [user_details, otp, motp] = await Promise.all([auth.getUser(userBody.email), await Math.floor(1000 + (9999 - 1000) * Math.random()), await Math.floor(1000 + (9999 - 1000) * Math.random())]);
    await auth.resendOtp(userBody, otp, motp);
    await Promise.all([this.sendMsgOtp(user_details.phone, motp), sendMail(userBody.email, otp)]);
    return true;
  }

  async loginUser(req, res) {
    let userBody = auth.decryptBodyJSON(req.headers.login, 'base64');
    let validate = this.validLoginBody(userBody); // Validate Login Body
    if (!validate) {
      res.send('Error');// error
      return false;
    }
    let loginCheck = await auth.loginCheck(userBody); // Check Login Body Password
    if (loginCheck === true) {
      if (await auth.verifiedUser(userBody)) {
        return token.getToken(userBody, req.headers);
      }
      await this.resend({
        headers: {
          resendotp: req.headers.login
        }
      });
      return 'unverified';
    }
    res.append('error', 'failed');
    return 'failed';
  }

  validUserBody(userBody) {
    if (!(userBody.name && userBody.email && userBody.phone && userBody.password)) {
      return false;
    }
    if (userBody.password.length < 8 || userBody.password.length > 15) {
      return false;
    }
    return true;
  }

  validLoginBody(userBody) {
    if (!(userBody.email && userBody.password)) {
      return false;
    }
    if (userBody.password.length < 8 || userBody.password.length > 15) {
      return false;
    }
    return true;
  }

  async verifyToken(req, key = 'token', encrypt = true) {
    try {
      let userToken = auth.decryptBodyJSON(req.headers[key]);
      let parser = auth.createKey(req.headers);
      let user_token = userToken.token && JSON.parse(auth.decrypt(userToken.token, parser)) || { key: 0 };
      let cacheToken = userToken.cacheToken && JSON.parse(auth.decrypt(userToken.cacheToken, parser)) || { key: 0 };
      let currentTime = new Date().getTime();
      let email = user_token.email || cacheToken.email;
      let user_exist = await auth.verifiedUser({ email: email });
      if ((user_token.key >= currentTime || cacheToken.key >= currentTime) && user_exist) {
        if (encrypt) {
          return Buffer.from(JSON.stringify({
            email: email
          })).toString('base64');
        }
        return email;
      }
      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async sendMsgOtp(mobile, otp) {
    await axios.post(`https://login.bulksmsgateway.in/sendmessage.php?user=Shreyas7b&password=Satbaf@73&mobile=${mobile}&sender=PANCHE&message=Your Pannache Verification Code is : ${otp}&type=3`);
  }

  async forgotPassword(req, res) {
    let email = req.headers.email;
    let result = await authDB.getUser(email);
    if (result) {
      try {
        let otp = await Math.floor(1000 + (9999 - 1000) * Math.random());
        await auth.forgotOtp(email, otp);
        let userBody = await authDB.getUser(email);
        await Promise.all([this.sendMsgOtp(userBody.phone, otp), sendMail(email, otp)]);
      } catch (error) {
        res.append('error', 'error');
        return 'Error';
      }
      return 'Success';
    }
    res.append('error', 'NoUserException');
    return 'Error';
  }

  async resetPassword(req, res) {
    let userBody = auth.decryptBodyJSON(req.headers.body);
    let result = await authDB.resetPassword(userBody.email, auth.encrypt(userBody.otp.toString()), userBody.password);
    if (result) {
      return 'Success';
    }
    res.append('error', 'IncorrectOtp');
    return 'Error';
  }
}
module.exports = Login;
