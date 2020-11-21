let express = require('express');
let app = express();
let { sendOtp } = require('./src/otpTry');
const Login = require('./src/login');
const Endpoint = require('./src/endpoint');
const Auth = require('./src/authutilities/authutilities');
const Payment = require('./src/payment/payment')
const bodyParser = require('body-parser');
const Cors = require('cors');
const endpoint = new Endpoint();
const login = new Login();
const auth = new Auth();
const payment = new Payment();
const https = require('https');
let {name} = require('./src/payment');


//Paytm Integration

const path = require('path')
const qs = require('querystring')
const ejs = require('ejs')
const parseUrl = express.urlencoded({ extended: false })
const parseJson = express.json({ extended: false })
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
const checksum_lib = require('./Paytm/checksum')
const config = require('./Paytm/config')
const { response } = require('express')



/*
* import checksum generation utility
* You can get this utility from https://developer.paytm.com/docs/checksum/
*/
const PaytmChecksum = require('paytmchecksum');

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

app.post('/placeorder',async function(req, res){
  email = "sandesh.bafna8@gmail.com"
  let result = await endpoint.createOrder(req,email);
  res.send(result)
})

app.post('/verifysignature',function(req,res){
  let signature ={
    razorpay_payment_id: "pay_Fwil7e6NZcZGgl", 
    razorpay_order_id: "order_FwijfvXHIfEkCZ", 
    razorpay_signature: "8e1dcb7cf6ac84f114f3d1216fad4c388fa884a26b178d44f9174d2f463538b9"
  }
  let result = endpoint.verifySignature(signature);
  console.log(result);
  res.send(result)
})

app.get('/paytmorder',async function(req,res){
  let result = await payment.PaytmPayment(req,res)
})

app.get('/send', async function(req,res){
  otp = 332934;
  mobile = 9611466394;
  let result = login.sendMsgOtp(mobile,otp);
  res.send(result);
})

app.get('/paynow', [parseUrl, parseJson], (req, res) => {
    var params = {};
    params['MID'] = config.PaytmConfig.mid;
    params['WEBSITE'] = config.PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'TEST_' + new Date().getTime();
    params['CUST_ID'] = 'customer_001';
    params['TXN_AMOUNT'] = "2151.00"//req.body.amount.toString();
    params['CALLBACK_URL'] = "http://192.168.43.119:1024/";
    params['EMAIL'] = "shreyas7bafna@gmail.com"//req.body.email;
    params['MOBILE_NO'] ="9611466394" //req.body.phone.toString();

    checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
      var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
      // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

      var form_fields = "";
      for (var x in params) {
        form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
      console.log(checksum);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      //res.write('<form method="post" id="f1" action="' + txn_url + '" name="f1">' + form_fields + '</form>');
      res.write('<form method="post" id = "f1" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script>');
      res.end();
    });
})


app.post('/callback', (req, res) => {
  var body = '';

  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    var html = "";
    var post_data = qs.parse(body);

    // received params in callback
    console.log('Callback Response: ', post_data, "\n");


    // verify the checksum
    var checksumhash = post_data.CHECKSUMHASH;
    // delete post_data.CHECKSUMHASH;
    var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
    console.log("Checksum Result => ", result, "\n");


    // Send Server-to-Server request to verify Order Status
    var params = { "MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID };

    checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

      params.CHECKSUMHASH = checksum;
      post_data = 'JsonData=' + JSON.stringify(params);

      var options = {
        hostname: 'securegw-stage.paytm.in', // for staging
        // hostname: 'securegw.paytm.in', // for production
        port: 443,
        path: '/merchant-status/getTxnStatus',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
        }
      };


      // Set up the request
      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on('data', function (chunk) {
          response += chunk;
        });

        post_res.on('end', function () {
          console.log('S2S Response: ', response, "\n");

          var _result = JSON.parse(response);
          res.render('response', {
            'data': _result
          })
        });
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
    });
  });
})

app.listen(8080);
