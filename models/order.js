const mongoose = require("mongoose");

let OrderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    user_id: {
      type: String,
      required: true
    },
    created_at: {
      type: Number
    },
    updated_at: {
      type: Number,
      default: 0
    },
    product_id: {
      type: String,
      required: true
    },
    product_type: {
      type: String,
      required: true
    },
    status: {
      type: String
    }
  },
  { _id: false }
);

module.exports.OrderSchema = OrderSchema;
