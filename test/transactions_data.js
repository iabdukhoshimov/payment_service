const { model } = require("mongoose");

const client_id = "7500f12b-fa9a-4935-b146-2bc15d2a74ea";

module.exports.transactionCreateData = {
  client_id: client_id,
  method: {
    operator: "PayMe",
    options: "card",
  },
  tariffs: [
    {
      tariff_id: "54759eb3c090d83494e2d804",
      duration: 28,
    },
  ],
  amount: 4500000,
  status: "success",
};

module.exports.transactionClientID = client_id;

module.exports.transactionFindReq = {
  search: "success",
};
