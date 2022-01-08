const UtilsDB = require('./utilsDB');
const utilsDB = new UtilsDB();

class Utils {
  async getItems(category) {
    let result = await utilsDB.getItems(category);
    return this.purifyItems(result);
  }
  
  async getItem(id) {
    let liveRate = await utilsDB.getGoldLiveRate();
    let result = await utilsDB.getItem(id);
    let [size, qualities, color] = await Promise.all([utilsDB.getSizes(result.category), utilsDB.getDquality(), utilsDB.getDcolor()]);
    result.sizes = size.sizes;
    result.dqualities = qualities.map(item => {return item.quality;});
    result.dcolors = color.map(item => {return item.color;});
    result = this.purifyItems([result])[0];
    [result.fashion] = await Promise.all([this.getItemDetails('fashion', id)]);
    result.live_gold_rate = liveRate;
    return result;
  }

  async getItemDetails(details_key, id) {
    let table = {
      fashion: 'fashion_category'
    };
    let detail = await utilsDB.getItemDetails(table, details_key, id);
    detail = detail && detail.map(item => {
      return item[details_key] || item;
    }) || null;
    return detail;
  }

  async getPrice(id, quality, color, size, requested_metal_gold, requested_platinum_metal) {
    let gold_purity = await utilsDB.getGoldPurityChart();
    let platinum_purity = await utilsDB.getPlatinumPurityChart();
    let gold_metal_type = requested_metal_gold | Object.keys(gold_purity)[0];
    let platinum_metal_type = requested_platinum_metal | Object.keys(platinum_purity)[0];
    
    let [liveGoldRate, result] = await Promise.all([utilsDB.getGoldLiveRate(), this.purifyItems([await utilsDB.getItem(id)])[0]]);
    let diamond_cost = 0;

    result.item_details = await Promise.all(result.item_details.map(async diamond => {
      let temp_weight = diamond.weight / diamond.quantity;
      let price = 0;
      if (temp_weight < 0.01) {
        price = await utilsDB.getPrice(Math.round(temp_weight * 1000) / 1000, quality.toUpperCase(), color.toUpperCase());
      } else {
        price = await utilsDB.getPrice(Math.round(temp_weight * 100) / 100, quality.toUpperCase(), color.toUpperCase());
      }
      let details = this.getDiamondCosting(diamond, price);
      diamond_cost = diamond_cost + details.price;
      return details;
    }));
    
    result.gold_details = await Promise.all(result.gold_details && result.gold_details.map(item => {
      let gold_price = 0;
      gold_price = (item.weight * gold_purity[gold_metal_type.toLowerCase()] * liveGoldRate) / 0.995;
      let platinum_price = 0;
      gold_price = (item.platinum_weight * platinum_purity[platinum_metal_type.toLowerCase()] * liveGoldRate) / 0.995;
      let details = this.getGoldCosting(item, gold_price);
      details = this.getPlatinumCosting(item, platinum_price);
      details.mkCharges = (details.weight * 900) + (details.platinum_weight * 900);
      return details;
    }) || []);

    let gold_rates = result.gold_details.length && await this.getGoldRates(result.gold_details.length && result.gold_details, size) || { size: 'default', weight: result.gold_wt, price: (result.gold_wt * gold_purity[gold_metal_type.toUpperCase()] * liveGoldRate) / 0.995 };
    let gold_rate = gold_rates.price; // result['gold_details'][x].price //(result.gold_wt*0.77*5000)/0.995 //Gold Rates
    let making_charges = gold_rates.weight * 900;
    let gst = Math.round((gold_rate + making_charges + diamond_cost) * 0.03);
    let tnx_charges = Math.round(((gst + gold_rate + making_charges + diamond_cost) * 0.02)); // gst 3%+2% charges
    let total_cost = Math.round(gold_rate * 100) / 100 + making_charges + diamond_cost + gst + tnx_charges;// total
    result.diamond_cost = diamond_cost;
    result.gold_rate = Math.round(gold_rate * 100) / 100;
    result.making_charges = making_charges;
    result.gst = Math.round(gst);
    result.total_cost = Math.round(total_cost);
    result.gold_weight = gold_rates.weight;
    result.tnx_charges = tnx_charges;
    return result;
  }

  getDiamondCosting(item, base_price) {
    let tem_item = item;
    tem_item.price = item.weight * base_price;
    return tem_item;
  }

  getGoldCosting(item, price) {
    let temp_item = item;
    temp_item.price = price;
    return temp_item;
  }

  getPlatinumCosting(item, price) {
    let temp_item = item;
    temp_item.platinum_price = price;
    return temp_item;
  }

  getGoldRates(result, size = 'default') {
    let arr = result.filter(item => {
      if (item.size === size) {
        return true;
      }
      return false;
    });
    return arr[0] && arr[0] || result[0];
  }

  purifyItems(body) {
    let newBody = [];
    body.forEach(item => {
      let item_temp = item;
      item_temp.image_link = JSON.parse(item_temp.image_link);
      item_temp.item_details = JSON.parse(item_temp.item_details);
      item_temp.gold_details = JSON.parse(item_temp.gold_details);
      newBody.push(item_temp);
    });
    return newBody;
  }

  purifyCart(body) {
    let newBody = body && body.reduce((prev, item) => {
      let item_temp = item;
      item_temp.image_link = JSON.parse(item_temp.image_link);
      prev.push(item_temp);
      return prev;
    }, []) || [];
    return newBody;
  }

  async removeItem(id, email) {
    let result = await utilsDB.removeItem(id, email);
    result = await this.getCartPrice(result);
    result = await this.purifyCart(result);
    return result;
  }

  async addToCart(req, email) {
    let encryptedBody = req.body.cart;
    let userBodyStr = Buffer.from(encryptedBody, 'base64').toString();
    let userBody = JSON.parse(userBodyStr);
    await utilsDB.addToCart(userBody, email);
    return 'Success';
  }

  async viewCart(email) {
    let result = await utilsDB.viewCart(email);
    result = await this.getCartPrice(result);
    result = await this.purifyCart(result);
    return result;
  }

  async updateCart(cart_id, quantity, email) {
    let result = await utilsDB.updateCart(cart_id, quantity, email);
    result = await this.getCartPrice(result);
    result = await this.purifyCart(result);
    return result;
  }

  async addTnxDetails(email, id, userBody, rate, amount, timestamp) {
    await utilsDB.addTnxDetails(email, id, userBody, rate, amount, timestamp);
    return true;
  }

  async getCartPrice(result) {
    let tempResult = result && await Promise.all(result.map(async item => {
      // item.title = 'PANAACCEEE'
      if (item.size === -1) {item.size = null;}
      // if(item.metal == "default"){item.metal = null}
      let price = await this.getPrice(item.item_id, item.quality, item.color, item.size, item.metal);
      item.finalPrice = price.total_cost * item.quantity;
      return item;
    })) || [];
    return tempResult;
  }

  async getOrderDetails(email) {
    let result = await utilsDB.getOrderDetails(email);
    result.forEach(async item => {
      item.order_details = JSON.parse(item.order_details);
      await item.order_details.cart.forEach(async cartItem => {
        result = await utilsDB.getItem(cartItem.item_id);
        cartItem.image_link = JSON.stringify(result.image_link);
      });
    });
    return result;
  }

  async changeOrderStatus(email, tnx_id, status, payment_id, time) {
    let result = await utilsDB.changeOrderStatus(email, tnx_id, status, payment_id, time);
    return result;
  }

  async deleteOrderCart(email, tnx_id) {
    let result = await utilsDB.getOrderDetails(email, tnx_id);
    result = JSON.parse(result[0].order_details).cart;
    result.forEach(item => {
      utilsDB.removeItem(item.cart_id, item.user_email);
    });
  }

  async getItemInfo(id) {
    let result = await utilsDB.getItemInfo(id);
    return result;
  }
}
module.exports = Utils;
