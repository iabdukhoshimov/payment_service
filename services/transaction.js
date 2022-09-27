const grpc = require("grpc");
const logger = require("../config/logger");
const { transactionStorage } = require("../storage/mongo/transaction");

const transactionService = {
  CreateTransaction: async (call, callback) => {
    logger.debug("Transaction Create Request", { label: "transaction", request: call.request });

    try {
      const response = await transactionStorage.create(call.request);
      callback(null, { id: response });
    } catch (err) {
      logger.error(err.message, { function: "CreateTransaction", request: call.request });
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  GetTransactionByClientID: async (call, callback) => {
    logger.debug("Get Transaction by User ID", { label: "transaction", request: call.request });

    try {
      const response = await transactionStorage.getTransactionsByUser(call.request);
      callback(null, response);
    } catch (err) {
      logger.error(err.message, { function: "GetTransactionByClientID", request: call.request });
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  Find: async (call, callback) => {
    logger.debug("Transaction Find Request", { label: "transaction", request: call.request });

    try {
      const response = await transactionStorage.find(call.request);
      callback(null, response);
    } catch (err) {
      logger.error(err.message, { function: "Find", request: call.request });
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
  UpdateStatus: async (call, callback) => {
    logger.debug("Transaction Update Status Request", {
      label: "transaction",
      request: call.request
    });

    try {
      const response = await transactionStorage.updateStatus(call.request);
      callback(null, response);
    } catch (err) {
      logger.error(err.message, { function: "UpdateStatus", request: call.request });
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
  GetTransactionByID: async (call, callback) => {
    logger.debug("Single transaction request", {
      function: "GetTransactionByID",
      request: call.request
    });

    try {
      const response = await transactionStorage.get(call.request);
      callback(null, {transaction: response});
    } catch (err) {
      logger.error(err.message, { function: "GetTransactionByID", request: call.request });
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  }
};

module.exports = transactionService;
