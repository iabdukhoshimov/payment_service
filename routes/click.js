const express = require("express");
const logger = require("../config/logger");
const router = express.Router();
const { click } = require("../services/click");
let cors = require("cors");

router.use(cors());


router.get("/ping", async (req, res) => {
  try {
    res.send({ pong: "Click Service is running!" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ pong: "Internal Server Error" });
  }
});

router.post('/prepare', async (req, res) => {
  let body = req.body;
  logger.info("Request from click", {
    request: body,
    label: "click"
  });

  const answer = await click.prepare(body);
  logger.info("Response to click", {
    response: answer,
    label: "click"
  });

  res.send(answer);
});

router.post('/complete', async (req, res) => {
  let body = req.body;
  logger.info("Request from click", {
    request: body,
    label: "click"
  });

  const answer = await click.complete(body);
  logger.info("Response to click", {
    response: answer,
    label: "click"
  });

  res.send(answer);
});

module.exports = router;