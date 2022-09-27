const clickStorage = require("../storage/mongo/click");
const logger = require("../config/logger");
const { clickWebhookErrors } = require("../click/utils");
const cfg = require("../config");

const generateClickLink = (data) => {
  let json = {"subscription_id": data.subscription_id, "keys": data.keys}
  let subscription_keys = JSON.stringify(json);

  return `${cfg.clickCheckoutURL}?service_id=${cfg.clickServiceId}&merchant_id=${cfg.clickMerchantId}&amount=${data.amount}&transaction_param=${subscription_keys}`;

};

const clickService = {
  GenerateClickLink: (call, callback) => {
    const link = generateClickLink(call.request);
    callback(null, { link });
  }
};

const click = {
  prepare: async (req) => {
    return clickWebhookErrors(req).then((result) => {
      if (result.error === 0) {
        clickStorage.updateTransactionStatus(req.click_trans_id, "WAITING").catch((err) => {
          logger.error(err);
        });
      }

      result.click_trans_id = req.click_trans_id;
      result.merchant_trans_id = req.merchant_trans_id;
      result.merchant_prepare_id = req.merchant_trans_id;

      return result;
    }).catch((err) => {
      logger.error(err);
    });
  },

  complete: async (req) => {
    return clickWebhookErrors(req).then((result) => {
      if (req.error < 0) { //&& (result.error != '-4' && result.error != '-9')
        clickStorage.updateTransactionStatus(req.click_trans_id, "REJECTED").catch((err) => {
          logger.error(err);
        });
      } else if (result.error === 0) {
        clickStorage.updateTransactionStatus(req.click_trans_id, "CONFIRMED").catch((err) => {
          logger.error(err);
        });
      }

      result.click_trans_id = req.click_trans_id;
      result.merchant_trans_id = req.merchant_trans_id;
      result.merchant_prepare_id = req.merchant_prepare_id;
      result.merchant_confirm_id = req.merchant_prepare_id;

      return result;
    });
  }
};

module.exports = {
  clickService,
  click
};
