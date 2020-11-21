let express = require('express');
let serverless = require('serverless-http');
let app = express();
let { sendOtp } = require('./src/otpTry');
const Login = require('./src/login');
const Endpoint = require('./src/endpoint');
const Auth = require('./src/authutilities/authutilities');
const bodyParser = require('body-parser');
const Cors = require('cors');
const endpoint = new Endpoint();
const login = new Login();
const auth = new Auth();
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
app.post('/forgot', function(req, res) {
  let result = sendOtp();
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
  res.send(result);
  // res.send(req.body)
});

app.post('/addtocart', async function(req, res) {
  let email = await login.verifyToken(req);
  let result = 'error';
  if (email) {
    result = await endpoint.addToCart(req, email);
  } else {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', 'error');
  }
  res.send(result);
});

app.post('/viewcart', async function(req, res) {
  let email = await login.verifyToken(req);
  let result = 'error';
  if (email) {
    result = await endpoint.viewCart(req, email);
  } else {
    res.append('Access-Control-Expose-Headers', 'token');
    res.append('token', 'error');
  }
  res.send(result);
});

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
const handler = serverless(app);
module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};
