const crypto = require("crypto");
const errors = require("../errors");
const clickStorage = require("../../storage/mongo/click");
const logger = require("../../config/logger");
const grpc_client = require("../../services/grpc_client/client");
const { getSubscription } = require("../../utils");
const { parseTariffsInfo, parseSubscriptionPriceForClick } = require("../../utils/subscription_utils");
const cfg = require("../../config");

module.exports = {
  clickWebhookErrors: (req) => {
    return new Promise(async (resolve, reject) => {
      let click_trans_id = req.click_trans_id || null;
      let service_id = req.service_id || null;
      let click_paydoc_id = req.click_paydoc_id || null;
      let subscription_keys = req.merchant_trans_id;
      let amount = req.amount || null;
      let action = req.action || null;
      let error = req.error || null;
      let error_note = req.error_note || null;
      let sign_time = req.sign_time || null;
      let sign_string = req.sign_string || null;
      let merchant_prepare_id = null;
      if (action != null && action == 1) {
        merchant_prepare_id = req.merchant_prepare_id || null;
      }
      if (!(subscription_keys)) {
        return resolve(errors.USER_NOT_EXISTS);
      }

      let parsed_keys = {}
      try {
        parsed_keys = JSON.parse(subscription_keys);
      } catch (err) {
        return resolve(errors.USER_NOT_EXISTS)
      }
      let subscription_id = parsed_keys.subscription_id;
      let keys = parsed_keys.keys;

      if (!isSet(req, ["click_trans_id", "service_id", "click_paydoc_id", "amount", "action", "error", "error_note",
        "sign_time", "sign_string"]) || (action == 1 && !isSet(req, ["merchant_prepare_id"]))) {
        return resolve(errors.ERROR_IN_REQUEST);
      }

      let signString = ``;
      if (action == 0) {
        signString += encoder(`${click_trans_id}${cfg.clickServiceId}${cfg.clickSecretKey}${subscription_keys}${amount}${action}${sign_time}`);
      } else if (action == 1) {
        signString += encoder(`${click_trans_id}${cfg.clickServiceId}${cfg.clickSecretKey}${subscription_keys}${merchant_prepare_id}${amount}${action}${sign_time}`);
      }

      if (signString != sign_string) return resolve(errors.SIGN_CHECK_FAILED);
      if (action != 1 && action != 0) return resolve(errors.ACTION_NOT_FOUND);

      let subscription = await getSubscription(subscription_id);

      let tariffs;
      if (subscription == null) {
        return resolve(errors.USER_NOT_EXISTS);
      } else {
        tariffs = parseTariffsInfo(subscription.tariffs, keys);

        if (!tariffs) {
          return resolve(errors.USER_NOT_EXISTS);
        }
      }
      let subPrice = parseSubscriptionPriceForClick(tariffs, keys);

      if (amount != subPrice) {
        return resolve(errors.INCORRECT_AMOUNT);
      }

      return clickStorage.getTransactionByClickTransId(click_trans_id).then((result) => {
        if (result.click.status == "CONFIRMED") {
          return resolve(errors.ALREADY_PAID);
        }

        if (action == 1 && subscription_keys != merchant_prepare_id) {
          return resolve(errors.TRANSACTION_NOT_FOUND);
        }

        if (result.click.status == "REJECTED" || error < 0) {
          return resolve(errors.TRANSACTION_CANCELLED);
        }

        return resolve(errors.SUCCESS);
      }).catch(async (err) => {
        if (err) {
          logger.error(err);
        }

        let clickInfo = {
          click_trans_id: click_trans_id,
          service_id: service_id,
          click_paydoc_id: click_paydoc_id,
          merchant_trans_id: subscription_keys,
          amount: amount,
          action: action,
          sign_time: sign_time
        };

        let transactionInfo = {
          client_id: subscription.user_id,
          tariffs: tariffs
        }

        return clickStorage.createTransaction(clickInfo, transactionInfo).then((result) => {
          return resolve(errors.SUCCESS);
        }).catch((err) => {
          logger.error(err);
        });
      });
    });
  }
};

function isSet(data, columns) {
  for (let i = 0; i < columns.length; i++) {
    if (!data[columns[i]]) return false;
  }

  return true;
}

function encoder(signString) {
  return crypto.createHash("md5").update(signString).digest("hex");
}
