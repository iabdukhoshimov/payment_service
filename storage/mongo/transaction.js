const logger = require("../../config/logger");
const { Transaction, trValidationSchema } = require("../../models/transaction");

let transactionStorage = {
  create: async data => {
    data.created_at = Date.now();
    data.transaction_number = generateTransactionNumber();
    const { error, value } = trValidationSchema.validate(data);

    if (error) {
      logger.error("Error while validation data", { label: "transaction", error: error });
      return new Error(error.message);
    }
    let ct = new Transaction(value);
    try {
      const response = await ct.save();
      logger.debug(`Transaction with ID ${response.id} is created`, {
        label: "transaction",
        result: response
      });

      return response.id;
    } catch (err) {
      logger.error("Error while creating a new record in transaction", {
        function: "create transaction",
        error: err
      });

      return err;
    }
  },

  getTransactionsByUser: async data => {
    if (!("client_id" in data)) {
      throw Error("client_id is requried!");
    }

    let { page, limit } = parsePageLimit(data);

    logger.debug(`Transaction with client id: ${data.client_id} is requested`, {
      label: "transaction"
    });

    try {
      const count = await Transaction.countDocuments({ client_id: data.client_id, status:"success" });
      const response = await Transaction.find({ client_id: data.client_id, status:"success" })
        .skip(page * limit)
        .limit(limit)
        .sort({created_at:-1})
        response.forEach(element => {
          element.type = element?.payme?.account?.type || "tvod"
        });
      return { transactions: response, count: count };
    } catch (err) {
      logger.error(`Error while retreiving transactions of user ${data.client_id}`, {
        function: "getTransactionsByUser",
        error: err
      });

      throw err;
    }
  },

  find: async data => {
    let { page, limit } = parsePageLimit(data);
    logger.debug(`Filtering transactions page: ${page}, limit: ${limit}`, { data });
    let response = {};
    let count = 0;

    if (data.search.trim() !== "") {
      count = await Transaction.countDocuments({
        $text: { $search: data.search, $caseSensitive: true }
      });
      response = await Transaction.find(
        { $text: { $search: data.search } },
        { $score: { $meta: "textScore" } }
      )
        .sort({ created_at: -1, $score: { $meta: "textScore" } })
        .skip(page * limit)
        .limit(limit);
    } else {
      count = await Transaction.countDocuments();
      response = await Transaction.find()
        .sort({created_at: -1})
        .skip(page * limit)
        .limit(limit);
    }

    return { transactions: response, count: count };
  },
  updateStatus: async data => {
    if (!("id" in data)) {
      throw Error("id of the object is requried");
    }

    if (!("status" in data)) {
      throw Error("status of the object is required!");
    }
    logger.debug(`Updating status of trnsaction for ${data.id}`, {
      lagel: "transaction"
    });

    try {
      const response = await Transaction.findOneAndUpdate(
        { _id: data.id },
        { status: data.status }
      );
      return response;
    } catch (err) {
      logger.error(`Error while updating transaction for ${data.id}`, {
        function: "updateStatus",
        error: err
      });
      throw Error(err.message);
    }
  },
  get: async data => {
    if (!("id" in data)) {
      throw new Error("id is a required field");
    }

    try {
      const response = await Transaction.findOne({ _id: data.id });
      return response;
    } catch (err) {
      logger.error(`Error while retreiving a transction with id: ${data.id}`, {
        function: "get",
        error: err
      });

      throw Error(err.message);
    }
  }
};

function parsePageLimit(data) {
  let page = data.page || 0;
  let limit = data.limit || 50;

  try {
    page = parseInt(page);
    limit = parseInt(limit);
  } catch (err) {
    logger.error("page or limit is given in other than Number data type", {
      label: "transaction",
      function: "find"
    });
    page = 0;
    limit = 10;
  }

  // substracting 1 to match page limit result: expected result => (page - 1) * limit
  page = page != 0 ? page - 1 : page;

  return { page, limit };
}

function generateTransactionNumber() {
  let trNumber = Date.now().toString();
  let randomNumber = getRandomInt(10);
  return `${trNumber.slice(-8)}${randomNumber}`;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports.transactionStorage = transactionStorage;
