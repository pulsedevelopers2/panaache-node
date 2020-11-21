const Utils = require('./utilities/utils');
const Razorpay = require('razorpay');
const crypto = require('crypto')

const utils = new Utils();
const instance = new Razorpay({
  key_id:"rzp_test_lTEoCEehuqOkFf",
  key_secret:"dZpYLxagmZzczoCj1zfq7ffV"
})

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

  async removeItem(req,email){
    let id = req.body.cart_id;
    let result = await utils.removeItem(id,email);
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

  async updateCart(req,email){
    let cart_id = req.body.cart_id;
    let quantity = req.body.quantity;
    let result = await utils.updateCart(cart_id,quantity,email);
    return result;
  }

  async createOrder(req,email){
    let result = await utils.viewCart(req, email);
    let finalPrice = 0;
    result.forEach(item => {
      finalPrice = finalPrice + item.finalPrice;
    });
    var options = {
      amount: finalPrice*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11"
    };
    instance.orders.create(options).then((data)=>{
      console.log(data);
      return data;
    })
  }

  verifySignature(signature){
   // generated_signature = hmac_sha256("order_FwijfvXHIfEkCZ" + "|" + "pay_Fwil7e6NZcZGgl", "dZpYLxagmZzczoCj1zfq7ffV");  
    let generated_signature = crypto.createHmac('sha256',instance.key_secret).update(signature.razorpay_order_id + "|" +signature.razorpay_payment_id).digest('hex');
    if (generated_signature == signature.razorpay_signature) {
      return "success";  
    }
    else{
      return "failure";
    }
    return "failure";
  }

}
module.exports = Endpoint;
