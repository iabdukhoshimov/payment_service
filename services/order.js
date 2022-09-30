const logger = require("../config/logger");
const { orderStorage } = require("../storage/mongo/order");

let createOrder = async (data) => {
  try {
    console.log("create order req: ", data);
    let tr = await orderStorage.createOrder(data);
    return tr;
  } catch (error) {
    logger.error(err);
  }
};


const orderService = {
  Create: (call, callback) => {
    const link = createOrder(call.request);
    callback(null, { link });
  },
  // GeneratePaymeLinkSvod: (call, callback) => {
  //   const link = generatePaymeLinkSvod(call.request);
  //   callback(null, { link });
  // }
};

module.exports = {
  orderService
};
