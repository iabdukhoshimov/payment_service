  const { Transaction } = require("../../models/transaction");
const logger = require("../../config/logger");
const utils = require("../../utils/index");
const { mapClickStatus } = require("../../payme/constants");


const transactionClick = {
  operator: "Click",
  options: "card"
};

const clickStorage = {
  createTransaction: async (clickInfo, transactionInfo) => {
    if (!clickInfo) throw new Error("click info is required!");
    if (!transactionInfo) throw new Error("transaction Info is required!");

    clickInfo.merchant_prepare_id = utils.generate8D();
    status = mapClickStatus(clickInfo.status);
    let transaction = {
      method: transactionClick,
      client_id: transactionInfo.client_id,
      amount: parseInt(clickInfo.amount * 100),
      tariffs: transactionInfo.tariffs,
      status: status,
      transaction_number: clickInfo.merchant_prepare_id,
      click: clickInfo,
      created_at: Date.now()
    };
    try {
      let t = new Transaction(transaction);
      return await t.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateTransactionStatus: async (click_trans_id, status) => {
    if (!click_trans_id) throw new Error("click trans id is required");
    if (!status) throw new Error("status is required");
    let transactionStatus = mapClickStatus(status);

    try {
      let t = await Transaction.findOne({ "click.click_trans_id": click_trans_id});
      t.click.status = status;
      t.status = transactionStatus;
      t.updated_at = Date.now();
      return await t.save();
    } catch (error) {
      throw new Error(error.message);
    }

  },

  getTransactionByClickTransId: async (click_trans_id) => {
    if (!click_trans_id) throw new Error("click trans id is required");
    try {
      let res =  await Transaction.findOne({ "click.click_trans_id": click_trans_id, deleted_at: 0});
      if (!res) throw new Error("Document not found")
      return res;
    } catch (error) {
      throw new Error(error.message)
    }

  }
};

module.exports = clickStorage;
