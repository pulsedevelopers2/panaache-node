let express = require('express');
let app = express();
const Login = require('./src/login');
const Endpoint = require('./src/endpoint');
const Auth = require('./src/authutilities/authutilities');
const bodyParser = require('body-parser');
const Cors = require('cors');
const endpoint = new Endpoint();
const login = new Login();
const auth = new Auth();
express.urlencoded({ extended: false })
express.json({ extended: false })
const { response } = require('express')
const crypto = require('crypto')
const SendEmail = require('./src/mails/sendEmail');
const Utils = require('./src/utilities/utils');
const send = new SendEmail();

app.use(Cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  res.append('Access-Control-Allow-Credentials', 'true');
  res.append('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.append('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});
let jsonParser = bodyParser.json();

app.post('/', function(req, res) {
  res.send('hello world');
});
app.post('/signup', async function(req, res) {
  let result = await login.signUp(req, res);
  res.append('Access-Control-Expose-Headers', 'signup,error');
  res.append('signup', result);
  res.send(result);
});

app.post('/verifyOtp', async function(req, res) {
  let result = await login.verifyOtp(req, res);
  res.append('Access-Control-Expose-Headers', 'token,error');
  res.append('token', result);
  res.send('Success');
});

app.post('/resend', async function(req, res) {
  let result = await login.resend(req, res);
  res.append('Access-Control-Expose-Headers', 'token,error');
  res.append('token', result);
  res.send('Success');
});

app.post('/login', async function(req, res) {
  let result = await login.loginUser(req);
  res.append('Access-Control-Expose-Headers', 'token,error');
  res.append('token', result);
  res.send('Success');
});

app.post('/cachelogin', function(req, res) {
  let result = login.verifyToken(req, 'cache');
  if (result) {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', result);
    res.send('Success');
  } else {
    let parser = auth.createKey(req.headers);
    let token = null;
    let cacheToken = null;
    result = JSON.stringify({
      token: this.encrypt(token, parser),
      cacheToken: this.encrypt(cacheToken, parser)
    });
    result = Buffer.from(result).toString('base64');
    res.status(403).send('error');
  }
});

app.post('/forgotpassword',async function(req, res) {
  let result = await login.forgotPassword(req,res);
  res.append('Access-Control-Expose-Headers', 'error');
  res.send(result);
});

app.post('/resetpassword',async function(req, res) {
  let result = await login.resetPassword(req,res);
  res.append('Access-Control-Expose-Headers', 'error');
  res.send(result);
});

app.post('/getitems/:category', async function(req, res) {
  let result = await endpoint.getItems(req, res, req.params.category);
  // res.append('Access-Control-Expose-Headers','items,token,error')
  // res.append('items',result);
  res.send(result);
});

app.post('/getitem/:id', async function(req, res) {
  let result = 'error';
  if (login.verifyToken(req)) {
    result = await endpoint.getItem(req, res, req.params.id);
    console.log(result)
  } else {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', 'error');
  }
  res.send(result);
});

app.post('/pricing', jsonParser, async function(req, res) {
  let result = 'error';
  if (login.verifyToken(req)) {
    result = await endpoint.getPrice(req, res);
  } else {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', 'error');
  }
  console.log(result)
  res.send(result);
  // res.send(req.body)
});

app.post('/addtocart', jsonParser,async function(req, res) {
  let email = await login.verifyToken(req, 'token',false);
  let result = 'error';
  if (email) {
    result = await endpoint.addToCart(req, email);
  } else {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', 'error');
  }
  console.log(result)
  res.send(result);
});

app.post('/viewcart', async function(req, res) {
  let email = await login.verifyToken(req ,'token',false);
  let result = 'error';
  if (email) {
    result = await endpoint.viewCart(req, email);
  } else {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', 'error');
  }
  res.send(result);
});

app.post('/remove', jsonParser,async function(req,res){
  let email = await login.verifyToken(req,'token',false)
 // email = "sandesh.bafna8@gmail.com"
  console.log(email);
  let result = 'error';
  if(email){
    result = await endpoint.removeItem(req,email);
  } else {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', 'error');
  }
  res.send(result);
})

app.post('/viewcart1', async function(req, res) {
  let email = 'sandesh.bafna8@gmail.com';// await login.verifyToken(req);
  let result = 'error';
  if (email) {
    result = await endpoint.viewCart(req, email);
  } else {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', 'error');
  }
  res.send(result);
});

app.post('/updateCart', jsonParser, async function(req,res){
    let email = await login.verifyToken(req,'token',false)
    //email = "sandesh.bafna8@gmail.com"
    console.log(email);
    let result = 'error';
    if(email){
      result = await endpoint.UpdateCart(req,email);
    } else {
      res.append('Access-Control-Expose-Headers', 'token');
      res.append('token', 'error');
    }
    res.send(result);
})

app.post('/placeorder', jsonParser,async function(req, res){
  let email = login.verifyToken(req,'token',false)
  if(email){
    let result = await endpoint.createOrder(req,email);
    res.send(result)
  }
})

app.post('/verifyorder',async function(req,res){
  let email = login.verifyToken(req,'token',false)
  if(email){
    let result = await endpoint.verifyPayment(req,res,email)
    res.send(result)
  }
})

app.post('/getorders',async function(req,res){
  let email = login.verifyToken(req,'token',false)
//let email = 'sandesh.bafna8@gmail.com'
  if(email){
    let result = await endpoint.getOrderDetails(email)
    res.send(result)
  }
})

app.post('/getitemdetails/:id',async function(req,res){
  //let email = login.verifyToken(req,'token',false)
  let email = 'sandesh.bafna8@gmail.com'
  if(email){
    let result = await endpoint.getItemInfo(req.params.id)
    res.send(result)
  }  
})

app.post('/paymentdetails', async function(){
  let email = login.verifyToken(req,'token',false)
  if(email){
    let result = await endpoint.getPaymentDetail(req,res,email)
  }
  var request = require('request');
request('https://rzp_test_lTEoCEehuqOkFf:dZpYLxagmZzczoCj1zfq7ffV@api.razorpay.com/v1/payments/pay_G8HOzTcJeIH9eQ', function (error, response, body) {
  console.log('Response:', body);
});
})

app.post('/sendmail', async function(req,res){
  let email = 'shreyas7bafna@gmail.com';
  let result = await send.sendOrderConfirmation(email);
  res.send(result);
})

app.listen(8080);
