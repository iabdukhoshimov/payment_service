module.exports = {
  checkPerformTransactionAnswer: () => {
    let body = {
      result: {
        allow: true
      }
    };

    return body;
  },

  createTransactionAnswer: (createTime, transaction, state) => {
    let body = {
      result: {
        create_time: createTime,
        transaction: transaction,
        state: state
      }
    };

    return body;
  },

  performTransactionAnswer: (transaction, performTime, state) => {
    let body = {
      result: {
        transaction: transaction,
        perform_time: performTime,
        state: state
      }
    };

    return body;
  },

  cancelTransactionAnswer: (transaction, cancelTime, state) => {
    let body = {
      result: {
        transaction: transaction,
        cancel_time: cancelTime,
        state: state
      }
    };

    return body;
  },

  checkTransactionAnswer: (createTime, performTime, cancelTime, transaction, state, reason) => {
    let body = {
      result: {
        create_time: createTime,
        perform_time: performTime,
        cancel_time: cancelTime,
        transaction: transaction,
        state: state,
        reason: reason || null
      }
    };

    return body;
  },

  transactionsAnswer: (transactions) => {
    let body = {
      result: transactions
    };

    return body;
  }
};
