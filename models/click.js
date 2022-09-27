const mongoose = require("mongoose");

let ClickSchema = new mongoose.Schema(
  {
    click_trans_id: {
      type: Number
    },
    service_id: {
      type: Number
    },
    click_paydoc_id: {
      type: Number
    },
    prepare_id: {
      type: Number
    },
    amount: {
      type: Number
    },
    action: {
      type: Number
    },
    error: {
      type: Number,
      default: 0,
    },
    error_note: {
      type: String,
    },
    sign_time: {
      type: String
    },
    sign_string: {
      type: String,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "REJECTED", "WAITING"]
    },
  },
  {
    _id: false
  }
);

module.exports.ClickSchema = ClickSchema;
