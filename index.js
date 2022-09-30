const express = require("express");

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const logger = require("./config/logger.js");
const cfg = require("./config");
const { paymeService } = require("./services/payme");
const { clickService } = require("./services/click");
const { orderService } = require("./services/order");

const payMeRouter = require("./routes/payme");
const clickRouter = require("./routes/click");

// loading proto file
const PROTO_URL = __dirname + "/protos/payment_service/payment_service.proto";

const packageDefinition = protoLoader.loadSync(PROTO_URL, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const paymentProto = grpc.loadPackageDefinition(packageDefinition).payments;

function main() {
  logger.info("Main function is running");

  // Connecting to database
  let mongoDBUrl =
    "mongodb://" +
    cfg.mongoUser +
    ":" +
    cfg.mongoPassword +
    "@" +
    cfg.mongoHost +
    ":" +
    cfg.mongoPort +
    "/" +
    cfg.mongoDatabase;

  mongoDBUrl = "mongodb://localhost:27018/payment_service";
  logger.info("Connecting to db: " + mongoDBUrl);

  mongoose.connect(
    mongoDBUrl,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    (err) => {
      if (err) {
        logger.error("There is an error in connecting db (" + mongoDBUrl + "): " + err.message);
        process.exit();
      }
    }
  );

  mongoose.connection.once("open", function () {
    logger.info("Connected to the database");

    setTimeout(() => {}, 1000);
  });

  // gRPC server
  let server = new grpc.Server();

  server.addService(paymentProto.TransactionService.service, require("./services/transaction.js"));
  server.addService(paymentProto.PaymeService.service, paymeService);
  server.addService(paymentProto.ClickService.service, clickService);
  server.addService(paymentProto.OrderService.service, orderService);

  server.bind("0.0.0.0:" + cfg.RPCPort, grpc.ServerCredentials.createInsecure());

  server.start();
  logger.info("grpc server is running at %s", cfg.RPCPort);

  // express server
  let app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use("/payme", payMeRouter);
  app.use("/click", clickRouter);

  app.listen(cfg.HTTPPort, () => {
    logger.info("express is running at %s", cfg.HTTPPort);
  });
}

main();
