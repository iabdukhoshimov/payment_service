const mongoose = require("mongoose");
const Joi = require("joi");
const { PaymeSchema } = require("./payme");
const { ClickSchema } = require("./click");
const { statuses } = require("../utils/state_constants");

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

const validOptions = ["ussd", "card"];
const defaultStatus = "initial";

const TransactionSchema = new mongoose.Schema({
  method: {
    operator: {
      type: String,
      required: true
    },
    options: {
      type: String,
      enum: validOptions,
      required: true
    }
  },
  // tariffs: [
  //   {
  //     tariff_id: {
  //       type: String,
  //       required: true
  //     },
  //     duration: {
  //       type: Number,
  //       required: true
  //     }
  //   }
  // ],

  client_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: statuses,
    default: defaultStatus
  },
  transaction_number: {
    type: Number,
    required: true,
    default: 11111111
  },
  payme: PaymeSchema,
  click: ClickSchema,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  },
  deleted_at: {
    type: Number,
    default: 0
  }
});

const trValidationSchema = Joi.object({
  method: Joi.object({
    operator: Joi.string().min(3).max(100).required(),
    options: Joi.string().valid(...validOptions)
  }),
  tariffs: Joi.array().items({
    tariff_id: Joi.string().min(3).max(100).required(),
    duration: Joi.number().min(1).required()
  }),
  client_id: Joi.string().min(3).max(100).required(),
  amount: Joi.number().min(1).required(),
  status: Joi.string()
    .valid(...statuses)
    .default(defaultStatus)
}).options({ allowUnknown: true });

TransactionSchema.index({ status: "text", amount: "text", "method.operator": "text" });

module.exports.Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports.trValidationSchema = trValidationSchema;
