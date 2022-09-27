const express = require("express");
const logger = require("../config/logger");
const paymeUtils = require("../payme/utils");
const paymeExceptions = require("../payme/exceptions");
const { payMe } = require("../services/payme");

const router = express.Router();
let cors = require("cors");

router.use(cors());

router.get("/ping", async (req, res) => {
  try {
    res.send({ pong: "PayMe Service is running!" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ pong: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    logger.info("Request from payme", { request: req.body, label: "payme" });
    const params = req.body.params;
    let isAuth = await paymeUtils.isAuthValid(req);
console.log("req: ", req.header("Authorization"))
    if (!isAuth) {
      console.log("isAuth is: ", isAuth);
      return res.send(paymeExceptions.unathorizedRequest(req.body.id));
    }
    let answer;
    console.log("isAuth is true");
    console.log("mehtod: ", req.body.method);

    switch (req.body.method) {
      case "CheckPerformTransaction":
        answer = await payMe.checkPerformTransaction(req.body.id, params.account, params.amount);
        break;
      case "CreateTransaction":
        answer = await payMe.createTransaction(
          req.body.id,
          params.id,
          params.time,
          params.amount,
          params.account
        );
        break;
      case "PerformTransaction":
        answer = await payMe.performTransaction(req.body.id, params.id);
        break;
      case "CancelTransaction":
        answer = await payMe.cancelTransaction(req.body.id, params.id, params.reason);
        break;
      case "CheckTransaction":
        answer = await payMe.checkTransaction(req.body.id, params.id);

        break;
      case "GetStatement":
        answer = await payMe.getStatement(params.from, params.to);
        break;
      default:
        answer = { method: "default" };
        break;
    }
    console.log("payme response: ", answer);
    return res.status(200).json(answer);
  } catch (error) {
    console.log(error.message);
    return res.status(400).send(error);
  }
});

module.exports = router;
