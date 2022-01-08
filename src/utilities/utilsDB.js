
let mysql = require('mysql-promise')();

class UtilsDB {
  constructor() {
    mysql.configure({
      host: '46.17.172.154',
      user: 'u386445862_panaache',
      password: 'Panaache@123dev',
      database: 'u386445862_panaache'
    });
  }
    
  // async getItems(category) {
  //   let sql = `Select * from items where category = "${category}"`;
  //   let res = await mysql.query(sql);
  //   return (res[0].length ? res[0] : null);
  // }

  async getItems(category) {
    let cat = category.split(',');
    let sql = null;
    if (cat.length) {
      sql = ` where${cat.reduce((prev, curr) => {return `${prev} category="${curr}";`;}, '')}`;
    }
    sql = `Select * from items${sql}`;
    let res = await mysql.query(sql);
    return (res[0].length ? res[0] : null);
  }

  async getItem(id) {
    let sql = `Select * from items where id = "${id}"`;
    let res = await mysql.query(sql);
    return (res[0].length ? res[0][0] : null);
  }

  async getSizes(category) {
    let sql = `select sizes from category where category_name = "${category.toLowerCase()}"`;
    let res = await mysql.query(sql);
    return (res[0].length ? res[0][0] : null);
  }

  async getDquality() {
    let sql = 'select quality FROM d_quality';
    let res = await mysql.query(sql);
    return (res[0].length ? res[0] : null);
  }
  async getDcolor() {
    let sql = 'select color FROM d_color';
    let res = await mysql.query(sql);
    return (res[0].length ? res[0] : null);
  }
  async getItemDetails(table, detail, id) {
    let sql = `Select ${detail} from ${table[detail] || detail} where id = "${id}"`;
    let res = await mysql.query(sql);
    return (res[0].length ? res[0] : null);
  }

  async getGoldPurityChart() {
    let sql = 'Select * from m_category where metal_category = "gold" order by 1 desc';
    let res = await mysql.query(sql);
    return (res[0].length ? res[0] : {});
  }

  async getPlatinumPurityChart() {
    let sql = 'Select * from m_category where metal_category = "platinum" order by 1 desc';
    let res = await mysql.query(sql);
    return (res[0].length ? res[0] : {});
  }

  async getPrice(ct, quality, color) {
    let sql = `Select price from qcs_pricing where quality = "${quality}" and color = "${color}" and carat_wt = ${ct}`;
    let result = await mysql.query(sql);
    return (result[0].length ? result[0][0].price : null);
  }

  async getGoldLiveRate() {
    let sql = 'Select rate from gold_rate where id = 12321';
    let result = await mysql.query(sql);
    return (result[0].length ? result[0][0].rate : null);
  }

  async addToCart(userBody, email) {
    if (userBody.metal === null) {
      userBody.metal = 'default';
    }
    if (userBody.size === null) {
      userBody.size = -1;
    }
    let sql = `insert into users_cart(item_id,user_email,quantity,quality,color,size,metal) values ("${userBody.item_id}","${email}",${userBody.quantity},"${userBody.quality}","${userBody.color}",${userBody.size},"${userBody.metal}") `;
    let result = await mysql.query(sql);
    return result;
  }

  async addTnxDetails(email, tnx_id, details, rate, amount, timestamp) {
    let sql = `insert into order_summary(tnx_id,email,order_details,curr_price,amount,timestamp) values ("${tnx_id}","${email}","${details}",${rate},${amount},${timestamp}) `;
    let result = await mysql.query(sql);
    return result;
  }

  async getOrderDetails(email, tnx_id = null) {
    let sql = '';
    if (tnx_id) {
      sql = `select * from order_summary where email = '${email}' and tnx_id = '${tnx_id}' order by 1 desc`;
    } else {
      sql = `select * from order_summary where email = '${email}' and status = 'order_placed' order by 1 desc`;
    }
    let result = await mysql.query(sql);
    return (result[0].length ? result[0] : []);
  }

  async getItemInfo(id) {
    let sql = `Select image_link,title from items where id = "${id}"`;
    let res = await mysql.query(sql);
    return (res[0].length ? res[0][0] : null);
  }

  async changeOrderStatus(email, tnx_id, status, payment_id, time) {
    let sql = `update order_summary set status = "${status}",payment_id = "${payment_id}", timestamp = ${time} where email = "${email}" and tnx_id = "${tnx_id}"`;
    let result = await mysql.query(sql);
    // return this.getOrderDetails(email);
    return result;
  }

  async viewCart(email) {
    let sql = `select users_cart.*, items.image_link ,items.title from users_cart left join items on users_cart.item_id = items.id where users_cart.user_email = "${email}"`;
    let result = await mysql.query(sql);
    return (result[0].length ? result[0] : null);
  }

  async updateCart(cart_id, quantity, email) {
    let sql = `update users_cart set quantity = ${quantity} where cart_id = ${cart_id} and email = "${email}"`;
    await mysql.query(sql);
    return this.viewCart(email);
  }

  async removeItem(id, email) {
    let sql = `Delete from users_cart where cart_id = '${id}' and user_email = "${email}"`;
    await mysql.query(sql);
    return this.viewCart(email);
  }
}
module.exports = UtilsDB;
