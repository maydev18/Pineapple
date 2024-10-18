const fs = require('fs');
const axios = require('axios');
const SizeConverter = require('../SizeConverter');
const paymentUtils = require("../../../utils/paymentVerify")
let shipRocketToken = null;
let tokenExpiry = null;
function loadTokenFromFile(){
    try{
        if(fs.existsSync('shipRocketToken.json')){
            const data = JSON.parse(fs.readFileSync('shipRocketToken.json' , 'utf-8'));
            shipRocketToken = data.token;
            tokenExpiry = data.expiry;
        }
    }
    catch(err){
        console.log("Cant fetch token from file");
    }
}

function saveTokenToFile(token , expiry){
    const data = {token : token ,expiry : expiry};
    fs.writeFileSync('shipRocketToken.json' , JSON.stringify(data));
}

async function getShipRocketToken(){
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (!shipRocketToken || currentTime >= tokenExpiry - 86400) { // Refresh 1 day before expiry
        const response = await fetchShiprocketTokenFromAPI(); // Get new token
        shipRocketToken = response;
        tokenExpiry = currentTime + 864000; //as token expires in 10 days
        saveTokenToFile(shipRocketToken, tokenExpiry); // Persist to file
    }
    return shipRocketToken;
}
//fetches token from shiprocket API
async function fetchShiprocketTokenFromAPI(){
    const body = {
        email : process.env.SHIP_ROCKET_EMAIL,
        password : process.env.SHIP_ROCKET_PASS
    }
    const res = await axios.post(process.env.SHIP_ROCKET_BASE_URL + 'auth/login' , body , {
        'Content-type' : 'application/json'
    });
    return res.data.token;
}

function createOrderProducts(products){
    const updatedProducts = products.map(product => {
        return {
            "name": `${product.title}  ${SizeConverter.getSize(product.size)} `,
            "sku": product._id.toString() + SizeConverter.getSmallSize(product.size),
            "units": product.quantity,
            "selling_price": product.price,
            "discount": "",
            "tax": 5,
            "hsn": ""
        }
    });
    return updatedProducts;

}
exports.createShipRocketOrder = async(order , payable , total , totalItems) => {
    try{
        const token = await getShipRocketToken();
        const updatedProducts = createOrderProducts(order.products);
        const data = {
            "order_id": order.orderID,
            "order_date": new Date(),
            "pickup_location": "Home",
            "channel_id": "5406678",
            "comment": "",
            "reseller_name": "",
            "company_name": "thepineapple.in",
            "billing_customer_name": order.address.fullName,
            "billing_last_name": "",
            "billing_address": order.address.firstLine,
            "billing_address_2": order.address.secondLine,
            "billing_isd_code": "",
            "billing_city": order.address.city,
            "billing_pincode": order.address.pincode,
            "billing_state": order.address.state,
            "billing_country": "India",
            "billing_email": order.address.email,
            "billing_phone": order.address.phone,
            "billing_alternate_phone":"",
            "shipping_is_billing": true,
            "shipping_customer_name": "",
            "shipping_last_name": "",
            "shipping_address": "",
            "shipping_address_2": "",
            "shipping_city": "",
            "shipping_pincode": "",
            "shipping_country": "",
            "shipping_state": "",
            "shipping_email": "",
            "shipping_phone": "",
            "order_items": updatedProducts,
            "payment_method": order.method,
            "shipping_charges": order.method === 'cod' ? 100 : 0,
            "giftwrap_charges": "",
            "transaction_charges": "",
            "total_discount": total-payable,
            "sub_total": total,
            "length": 30,
            "breadth": 45,
            "height": totalItems * 2,
            "weight": totalItems * 0.5,
            "ewaybill_no": "",
            "customer_gstin": "",
            "invoice_number":"",
            "order_type":"",
        }
        const res = await axios.post(process.env.SHIP_ROCKET_BASE_URL + 'orders/create/adhoc' , data , {
            headers : {
                'Content-type' : 'application/json',
                'authorization' : 'bearer ' + token
            }
        });
        //res.data contains the order_id and shipment_id of shiprocket order
        return res.data;
    }
    catch(error){
        // console.log(error.response ? error.response.data : error.message);
        throw error;
    }
}

exports.cancelOrder = async (orderID) => {
    try{
        const token = await getShipRocketToken();
        const res = await axios.post(process.env.SHIP_ROCKET_BASE_URL + 'orders/cancel' , JSON.stringify({"ids" : [orderID]}) , {
            headers : {
                "Content-type" : 'application/json',
                "authorization" : 'bearer ' + token
            }
        });
    }
    catch(err){
        console.log("cannot cancel the order");
    }
}
loadTokenFromFile();