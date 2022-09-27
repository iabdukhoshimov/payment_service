const cfg = require("../config");
const logger = require("../config/logger");

const paymeExceptions = require("../payme/exceptions");
const paymeAnswers = require("../payme/answers");
const { paymeStorage } = require("../storage/mongo/payme");
const { PAYME_STATES, timeExpired } = require("../payme/constants");
const UUIDv4 = require("uuid-v4-validator");
const { Transaction } = require("../models/transaction");
const { parseSubscriptionPrice, parseTariffsInfo } = require("../utils/subscription_utils");
const grpc_client = require("./grpc_client/client");
const { unableCompleteException } = require("../payme/exceptions");
const { isValidObjectId } = require("mongoose");

let generatePaymeLink = (data) => {
  console.log(data);
  let redirection_link = cfg.paymeRedirectURL;

  if (data.lang != "ru") {
    if (data.is_serial) {
      redirection_link += `${data.lang}/serials/${data.movie_slug}?season=${data.season_number}&episode=${data.episode_number}`;
    } else {
      redirection_link += `${data.lang}/movies/${data.movie_slug}`;
    }
  } else {
    if (data.is_serial) {
      redirection_link += `serials/${data.movie_slug}?season=${data.season_number}&episode=${data.episode_number}`;
    } else {
      redirection_link += `movies/${data.movie_slug}`;
    }
  }

  if (data.redirect_url != "") {
    redirection_link = data.redirect_url;
  }

  let params = `m=${cfg.paymeId};ac.purchase_id=${data.purchase_id};ac.type=tvod;a=${data.amount};c=${redirection_link}; ct=5000;`;
  let binaryData = Buffer.from(params, "utf-8");
  let link = "https://checkout.paycom.uz/" + binaryData.toString("base64");

  return link;
};

let generatePaymeLinkSvod = (data) => {
  console.log(data);
  let redirection_link = cfg.paymeRedirectURL;
  let movies = "movies";

  if (data.lang != "ru") {
    redirection_link += `${data.lang}/${data.path_key || movies}/${data.movie_key}`;
  } else {
    redirection_link += `${data.path_key || movies}/${data.movie_key}`;
  }

  if (data.redirect_url != "") {
    redirection_link = data.redirect_url;
  }

  let params = `m=${cfg.paymeId};ac.purchase_id=${data.purchase_id};ac.type=svod;a=${data.amount};c=${redirection_link}; ct=5000;`;
  let binaryData = Buffer.from(params, "utf-8");
  let link = "https://checkout.paycom.uz/" + binaryData.toString("base64");

  return link;
};

const paymeService = {
  GeneratePaymeLink: (call, callback) => {
    const link = generatePaymeLink(call.request);
    callback(null, { link });
  },
  GeneratePaymeLinkSvod: (call, callback) => {
    const link = generatePaymeLinkSvod(call.request);
    callback(null, { link });
  }
};

const payMe = {
  checkPerformTransaction: async (request_id, account, amount) => {
    try {
      let purchase;
      console.log("account type: ", account.type);

      if (account.type === "tvod") {
        if (!isValidObjectId(account.purchase_id)) {
          logger.error(`Recieved id is not valid: ${account.purchase_id}`);
          return paymeExceptions.subscriptionNotExistsException(request_id);
        }
        purchase = await grpc_client.getPurchaseByID(account.purchase_id);
        console.log("purch for tvod in services/payme: ", purchase);
      } else if (account.type === "svod") {
        console.log("is valid uuid: ", UUIDv4.UUIDv4.validate(account.purchase_id));
        if (!UUIDv4.UUIDv4.validate(account.purchase_id)) {
          logger.error(`Recieved uuid is not valid: ${account.purchase_id}`);
          return paymeExceptions.subscriptionNotExistsException(request_id);
        }
        purchase = await grpc_client.getUserSubscriptionByID(account.purchase_id);
        console.log("purch for svod in services/payme: ", purchase);
      }

      if (purchase.purchase == null) {
        return paymeExceptions.subscriptionNotExistsException(request_id);
      }

      if (purchase.purchase.price != amount)
        return paymeExceptions.wrongAmountException(request_id);

      return paymeAnswers.checkPerformTransactionAnswer();
    } catch (error) {
      console.log(error.message);
      return paymeExceptions.internalServerError(request_id);
    }
  },

  createTransaction: async (request_id, id, time, amount, account) => {
    let purchase;

    try {
      if (account.type === "tvod") {
        if (!isValidObjectId(account.purchase_id)) {
          logger.error(`Recieved id is not valid: ${account.purchase_id}`);
          return paymeExceptions.subscriptionNotExistsException(request_id);
        }
        purchase = await grpc_client.getPurchaseByID(account.purchase_id);
        console.log("purch for tvod in services/payme: ", purchase);
      } else if (account.type === "svod") {
        if (!UUIDv4.UUIDv4.validate(account.purchase_id)) {
          logger.error(`Recieved uuid is not valid: ${account.purchase_id}`);
          return paymeExceptions.subscriptionNotExistsException(request_id);
        }
        purchase = await grpc_client.getUserSubscriptionByID(account.purchase_id);
        console.log("purch for svod in services/payme: ", purchase);
      }
    } catch (error) {
      return paymeExceptions.internalServerError(request_id);
    }

    try {
      logger.debug(`id for getPaymeByID: ${id}`);
      let t = await paymeStorage.getPaymeByID(id);
      logger.debug(`t in getPaymeByID: ${t}`);
      if (t) {
        if (t.payme.state == PAYME_STATES.STATE_IN_PROGRESS) {
          if (Date.now() - t.payme.create_time > timeExpired) {
            return unableCompleteException(request_id);
          }

          return paymeAnswers.createTransactionAnswer(
            t.payme.create_time,
            t.payme.transaction,
            t.payme.state
          );
        }
      }

      let status = await payMe.checkPerformTransaction(request_id, account, amount);
      if (status.result) {
        let paymeInfo = {
          id: id,
          time: time,
          state: PAYME_STATES.STATE_IN_PROGRESS,
          account: account,
          amount: amount
        };

        let transaction = {
          method: { method: "PayMe", options: "card" },
          client_id: purchase.purchase.user_id,
          amount: amount
        };

        let tr = await paymeStorage.createTransaction(paymeInfo, transaction);

        return paymeAnswers.createTransactionAnswer(
          tr.payme.create_time,
          tr.payme.transaction,
          tr.payme.state
        );
      } else {
        return status;
      }
    } catch (error) {
      console.log(error.message);
      return paymeExceptions.internalServerError(request_id);
    }
  },

  performTransaction: async (request_id, id) => {
    let t;

    try {
      t = await paymeStorage.getPaymeByID(id);
      console.log("t: ", t);
      if (t) {
        console.log("192");
        if (t.payme.state == PAYME_STATES.STATE_IN_PROGRESS) {
          console.log("194");
          if (Date.now() - t.payme.created_at > timeExpired) {
            console.log("196");
            t.payme.state = PAYME_STATES.STATE_CANCELED;
            t.payme.perform_time = Date.now();

            let tr = await paymeStorage.updateTransaction(t.payme);
            return paymeExceptions.unableCompleteException(request_id);
          } else {
            console.log("203");
            t.payme.state = PAYME_STATES.STATE_DONE;
            t.payme.perform_time = Date.now();

            let subRes;
            if (t.payme.account.type === "tvod") {
            console.log("200");
              subRes = await grpc_client.makePurchaseActive(t.payme.account.purchase_id);
              console.log("subres for tvod in services/payme: ", subRes);
            } else if (t.payme.account.type === "svod") {
            console.log("213");
              subRes = await grpc_client.makePurchaseActiveSvod(t.payme.account.purchase_id);
              console.log("subres for svod in services/payme: ", subRes);
            }
            // else subRes = await grpc_client.makePurchaseActive(t.payme.account.purchase_id);

            t.status = "success";
            let tRes = await t.save();
            return paymeAnswers.performTransactionAnswer(
              tRes.payme.transaction,
              tRes.payme.perform_time,
              PAYME_STATES.STATE_DONE
            );
          }
        } else if (t.payme.state == PAYME_STATES.STATE_DONE) {
          console.log("228");
          return paymeAnswers.performTransactionAnswer(
            t.payme.transaction,
            t.payme.perform_time,
            PAYME_STATES.STATE_DONE
          );
        } else {
          console.log("235");
          return paymeExceptions.unableCompleteException(request_id);
        }
      }
      console.log("239");
      return paymeExceptions.transactionNotFoundException(request_id);
    } catch (error) {
      console.log("error occured on perform transaction", error.message);
      return paymeExceptions.internalServerError(request_id);
    }
  },

  cancelTransaction: async (request_id, id, reason) => {
    try {
      let t = await paymeStorage.getPaymeByID(id);
      if (!t) {
        return paymeExceptions.transactionNotFoundException(request_id);
      }
      console.log("transaction: ", t);
      if (t.payme.state == PAYME_STATES.STATE_IN_PROGRESS) {
        t.payme.state = PAYME_STATES.STATE_CANCELED;
      } else {
        try {
          if (t.payme.state == PAYME_STATES.STATE_DONE) {
            let res;
            if (t.payme.account.type === "tvod") {
              res = await grpc_client.makePurchaseCancel(t.payme.account.purchase_id);
              console.log("subres for tvod in services/payme: ", res);
            } else if (t.payme.account.type === "svod") {
              res = await grpc_client.makePurchaseCancelSvod(t.payme.account.purchase_id);
              console.log("subres for svod in services/payme: ", res);
            }
            // else res = await grpc_client.makePurchaseCancel(t.payme.account.purchase_id);
            t.payme.state = PAYME_STATES.STATE_POST_CANCELED;
          }
        } catch (error) {
          console.log(error);
          return paymeExceptions.unableCancelTransactionException(request_id);
        }
      }

      t.payme.cancel_time = t.payme.cancel_time ? t.payme.cancel_time : Date.now();

      t.payme.reason = reason;
      t.status = "cancelled";

      let tr = await paymeStorage.updateTransaction(t.payme);
      if (tr) {
        return paymeAnswers.cancelTransactionAnswer(
          tr.payme.transaction,
          tr.payme.cancel_time,
          tr.payme.state
        );
      }
    } catch (error) {
      logger.error(error);
      return paymeExceptions.internalServerError(request_id);
    }

    return paymeExceptions.unableCompleteException(request_id);
  },

  checkTransaction: async (request_id, id) => {
    try {
      let t = await paymeStorage.getPaymeByID(id);
      if (t) {
        return paymeAnswers.checkTransactionAnswer(
          t.payme.create_time,
          t.payme.perform_time,
          t.payme.cancel_time,
          t.payme.transaction,
          t.payme.state,
          t.payme.reason
        );
      } else {
        return paymeExceptions.transactionNotFoundException(request_id);
      }
    } catch (error) {
      logger.error(error);
      return paymeExceptions.internalServerError(request_id);
    }
  },

  getStatement: async (from, to) => {
    try {
      let transactions = await paymeStorage.getByPeriod(from, to, PAYME_STATES.STATE_DONE);
      return paymeAnswers.transactionsAnswer(transactions);
    } catch (error) {
      logger.error(error);
      return paymeExceptions.internalServerError();
    }
  }
};

module.exports = {
  paymeService,
  payMe
};
