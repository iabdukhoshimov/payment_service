const grpc_client = require("../services/grpc_client/client");
const logger = require("../config/logger");

module.exports = {
  getSubscription: async (subscription_id) => {
    return new Promise((resolve, reject) => {
      grpc_client.tariffService().GetSubscriptionByID(
        { id: subscription_id },
        (err, res) => {
          if (err) {
            logger.error(err);
            return resolve(null);
          }
          return resolve(res);
        }
      );
    });
  },
  generate8D: function() {
    let min = 10000000;
    let max = 100000000;
    return Math.floor(Math.random() * (min, max) + min);
  }
};