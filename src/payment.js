const axios = require('axios');
/*
* import checksum generation utility
* You can get this utility from https://developer.paytm.com/docs/checksum/
*/
const PaytmChecksum = require('paytmchecksum');

async function name() {
var paytmParams = {};

paytmParams.body = {
    "requestType"   : "Payment",
    "mid"           : "bxoawj84966211594074",
    "websiteName"   : "WEBSTAGING",
    "orderId"       : "ORDERID_987",
    "txnAmount"     : {
        "value"     : "1.00",
        "currency"  : "INR",
    },
    "userInfo"      : {
        "custId"    : "CUST_001",
    },
};

/*
* Generate checksum by parameters we have in body
* Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
*/
let checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "t6qwEqibojkx92bE");
paytmParams.head = {
    signature: checksum
}
let post_data = JSON.stringify(paytmParams);
let result = await axios.post('https://securegw-stage.paytm.in//theia/api/v1/initiateTransaction?mid=bxoawj84966211594074&orderId=ORDERID_987',post_data,{
    headers: {
        'Content-Type': 'application/json'
        }
})

console.log(result.data);
}
module.exports = {name}