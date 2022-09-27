const mongoose = require("mongoose");

let PaymeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    time: {
      type: Number
    },
    amount: {
      type: Number,
      required: true
    },
    account: {
      type: Object,
      required: true
    },
    create_time: {
      type: Number
    },
    perform_time: {
      type: Number,
      default: 0
    },
    cancel_time: {
      type: Number,
      default: 0
    },
    transaction: {
      type: String
    },
    state: {
      type: Number,
      default: 0
    },
    reason: {
      type: Number
    }
  },
  { _id: false }
);

module.exports.PaymeSchema = PaymeSchema;
