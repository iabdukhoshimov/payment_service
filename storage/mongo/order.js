const { Order } = require("../../models/order");
const logger = require("../../config/logger");
const uuid = require('uuid');
console.log(`Here is a test v1 uuid: ${uuid.v1()}`);
console.log(`Here is a test v4 uuid: ${uuid.v4()}`);

const orderStorage = {
  createOrder: async (data) => {
    if (!data) throw new Error("order data is required!");

    let order = {
      id : uuid.v4(),
      user_id: data.user_id,
      amount: data.price,
      product_id: data.product_id,
      product_type: data.product_type,
      status: "new",
      created_at: Date.now()
    };

    try {
      let o = new Order(order);
      const response = await o.save();
      let resp = {
        user_id : response.user_id,
        product_id: response.product_id,
        id : response.id
      }
      return resp;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = { orderStorage };
