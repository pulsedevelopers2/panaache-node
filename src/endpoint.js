const Utils = require('./utilities/utils');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const utils = new Utils();

const SendEmail = require('./mails/sendEmail');
const send = new SendEmail();

const instance = new Razorpay({
  key_id: 'rzp_test_lTEoCEehuqOkFf',
  key_secret: 'dZpYLxagmZzczoCj1zfq7ffV'
});

class Endpoint {
  async getItems(req, res, category) {
    let result = await utils.getItems(category);
    return result;
  }

  async getItem(req, res, id) {
    let result = await utils.getItem(id);
    return result;
  }

  async getPrice(req) {
    let id = req.body.item_id;
    let quality = req.body.d_quality;
    let color = req.body.d_color;
    let size = req.body.size;
    let result = await utils.getPrice(id, quality, color, size);
    return result;
  }

  async removeItem(req, email) {
    let id = req.body.cart_id;
    let result = await utils.removeItem(id, email);
    return result;
  }

  async addToCart(req, email) {
    let result = await utils.addToCart(req, email);
    return result;
  }

  async viewCart(req, email) {
    let result = await utils.viewCart(email);
    return result;
  }

  async updateCart(req, email) {
    let cart_id = req.body.cart_id;
    let quantity = req.body.quantity;
    let result = await utils.updateCart(cart_id, quantity, email);
    return result;
  }

  // async createOrder(email){
  //   let result = await utils.viewCart(email);
  //   let finalPrice = 0;
  //   result.forEach(item => {
  //     finalPrice = finalPrice + item.finalPrice;
  //   });
  //   console.log(finalPrice)
  //   var options = {
  //     amount: finalPrice*100,  // amount in the smallest currency unit
  //     currency: "INR",
  //     receipt: "order_rcptid_1011"
  //   };
  //   instance.orders.create(options).then(async (data)=>{
  //   result = await utils.addTnxDetails(email,data.id);
  //     console.log(data);
  //     return data;
  //   })
  // }
  async createOrder(req, email) {
    let encryptedBody = req.body.checkout;
    // console.log(typeof encryptedBody)
    let userBodyStr = Buffer.from(encryptedBody, 'base64').toString();
    let userBody = JSON.parse(userBodyStr);
    userBody.cart.final_price = await Promise.all(userBody.cart.map(async item => {
      let result = await utils.getPrice(item.item_id, item.quality, item.color, item.size, item.metal);
      return result.total_cost;
    }));
    let final = userBody.cart.final_price.reduce(function(a, b) {
      return a + b;
    }, 0);
    let curr_price = 5000;
    let addr = userBody.address;
    // let result = await utils.viewCart(email);
    // result.forEach(item => {
    //   finalPrice = finalPrice + item.finalPrice;
    // });
    let d = new Date();
    let options = {
      amount: final * 100, // amount in the smallest currency unit
      currency: 'INR',
      receipt: `Panaache_${d.getTime()}`
    };
    
    userBody.cart = userBody.cart.map(item => {
      delete item.image_link;
      delete item.title;
      return item;
    });
    let details = JSON.stringify(userBody);
    details = details.toString().replace(/"/g, '\\"');
    return instance.orders.create(options).then(async data => {
      let result = await utils.addTnxDetails(email, data.id, details, curr_price, data.amount / 100, d.getTime());
      if (result) {
        data.key = 'rzp_test_lTEoCEehuqOkFf';
        data.email = email;
        data.addrDetails = addr;
        return data;
      }
   
      return 'error';
    });
  }

  async verifyPayment(req, res, email) {
    let encryptedBody = req.headers.verify;
    let userBodyStr = Buffer.from(encryptedBody, 'base64').toString();
    let userBody = JSON.parse(userBodyStr);
    let razorpay_order_id = userBody.razorpay_order_id;
    let razorpay_payment_id = userBody.razorpay_payment_id;
    let razorpay_signature = userBody.razorpay_signature;
    let secret = 'dZpYLxagmZzczoCj1zfq7ffV';
    let result = '';
    let generatedSignature = crypto.createHmac('SHA256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (generatedSignature === razorpay_signature) {
      let d = new Date();
      result = await utils.changeOrderStatus(email, razorpay_order_id, 'order_placed', razorpay_payment_id, d.getTime()); // change status
      // result = await utils.getOrderDetails(email) //return orders
      result = await utils.deleteOrderCart(email, razorpay_order_id);
      result = await send.sendOrderConfirmation(email, razorpay_order_id, d);
      result = 'success';
    } else {
      result = 'error';
    }
    return result;
  }
  async getOrderDetails(email) {
    let result = await utils.getOrderDetails(email);
    return result;
  }

  async getItemInfo(id) {
    let result = await utils.getItemInfo(id);
    return result;
  }
}
module.exports = Endpoint;
