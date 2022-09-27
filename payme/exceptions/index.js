module.exports = {
  subscriptionNotExistsException: (id) => {
    return generateBodyOfError(id, -31050, "Subscription not found", "subscription");
  },

  waitingForPayment: (id) => {
    return generateBodyOfError(id, -31099, "Payment in progress", "subscription");
  },

  wrongAmountException: (id) => {
    return generateBodyOfError(id, -31001, "Wrong Amount", "amount");
  },

  unableCompleteException: (id) => {
    return generateBodyOfError(id, -31008, "Unable to complete operation", "transaction");
  },

  transactionNotFoundException: (id) => {
    return generateBodyOfError(id, -31003, "Transaction not found", "transaction");
  },

  unableCancelTransactionException: (id) => {
    return generateBodyOfError(id, -31007, "Unable to cancel transaction", "transaction");
  },

  internalServerError: (id) => {
    return generateBodyOfError(id, -32400, "Internal Server Error", "error");
  },

  unathorizedRequest: (id) => {
    return generateBodyOfError(id, -32504, "Unathorized request");
  }
};

function generateBodyOfError(id, code, message, data) {
  return (body = {
    error: {
      code: code,
      message: message,
      data: data
    },
    id: id
  });
}
