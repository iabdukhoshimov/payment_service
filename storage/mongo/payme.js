const { Transaction } = require("../../models/transaction");
const logger = require("../../config/logger");
const utils = require("../../utils");
const { mapStateToWord } = require("../../payme/constants");

const transactionPayme = {
  operator: "Payme",
  options: "card"
};

const paymeStorage = {
  createTransaction: async (paymeInfo, transactionInfo) => {
    if (!paymeInfo) throw new Error("payme info is required!");
    if (!transactionInfo) throw new Error("transaction Info is required!");

    paymeInfo.transaction = utils.generate8D();
    paymeInfo.create_time = paymeInfo.time;
    status = mapStateToWord(paymeInfo.state);

    let transaction = {
      method: transactionPayme,
      client_id: transactionInfo.client_id,
      amount: transactionInfo.amount,
      tariffs: transactionInfo.tariffs,
      status: status,
      transaction_number: paymeInfo.transaction,
      payme: paymeInfo,
      created_at: Date.now()
    };

    try {
      let t = new Transaction(transaction);
      const response = await t.save();
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateTransaction: async (paymeInfo) => {
    if (!paymeInfo) throw new Error("paymeInfo is required!");
    try {
      let t = await Transaction.findOne({ "payme.id": paymeInfo.id, deleted_at: 0 });
      t.payme = paymeInfo;
      t.updated_at = Date.now();
      const res = await t.save();

      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getPaymeByID: async (id) => {
    if (!id) throw new Error("id is required!");

    try {
      const res = await Transaction.findOne({ "payme.id": id });
      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getByPeriod: async (from, to, state) => {
    if (!from && !to) throw new Error("from and to is required!");
    let query = {
      deleted_at: 0,
      "payme.time": {
        $gte: new Date(from),
        $lt: new Date(to)
      },
      "payme.state": state
    };

    try {
      let trs = await Transaction.find(query);
      if (err) return reject(err);

      let transactions = {
        transactions: []
      };

      if (trs.length == 0) return resolve(transactions);

      for (let i = 0; i < trs.length; i++) {
        let t = trs[i];

        let transaction = {
          id: t.payme.id,
          time: t.payme.time,
          amount: t.payme.amount,
          account: t.payme.account,
          create_time: t.payme.create_time,
          perform_time: t.payme.perform_time,
          cancel_time: t.payme.cancel_time,
          transaction: t.payme.transaction,
          state: t.payme.state,
          reason: t.payme.reason,
          receivers: null
        };

        transactions.transactions.push(transaction);
      }

      return transactions;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = { paymeStorage };
