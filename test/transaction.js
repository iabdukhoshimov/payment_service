const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const logger = require("../config/logger");
const {
  transactionCreateData,
  transactionClientID,
  transactionFindReq,
} = require("./transactions_data");
const { reject } = require("async");

const PROTO_URL = __dirname + "/../protos/payment_service/payment_service.proto";

const packageDefinition = protoLoader.loadSync(PROTO_URL, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

let paymentProto = grpc.loadPackageDefinition(packageDefinition).payments;

let client = new paymentProto.TransactionService(
  "localhost:6061",
  grpc.credentials.createInsecure()
);

let createTransaction = () => {
  return new Promise((resolve, reject) => {
    client.CreateTransaction(transactionCreateData, (err, response) => {
      if (err) {
        console.log(err);

        return reject(err);
      }

      return resolve(response);
    });
  });
};

let getTransactionsByUserID = () => {
  return new Promise((resolve, reject) => {
    client.GetTransactionByClientID(
      {
        client_id: transactionClientID,
      },
      (err, response) => {
        if (err) {
          console.log(err);

          return reject(err);
        }

        return resolve(response);
      }
    );
  });
};

let updateTransactionStatus = (id) => {
  return new Promise((resolve, reject) => {
    client.UpdateStatus(
      {
        id: id,
      },
      (err, response) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        return resolve(response);
      }
    );
  });
};

let find = () => {
  return new Promise((resolve, reject) => {
    client.Find({page: 7, limit: 10}, (err, response) => {
      if (err) {
        console.log(err);
        return reject(err);
      }

      return resolve(response);
    });
  });
};

let getTransactionByID = (id) => {
  return new Promise((resolve, reject)=>{
    client.GetTransactionByID({id: id}, (err, res)=>{
      if (err ){
        return err
      }
      console.log(res)
    })
  })
}

let test = async () => {
  try {
    let res = await createTransaction();
    console.log(res);
    const id = res.id;
    res = await getTransactionByID(id)
    res = await getTransactionsByUserID();
    console.log(res);
    res = await find();
    console.log(res);
    res = await updateTransactionStatus(id);
    console.log("update status", res);
  } catch (err) {
    console.log(err);
  }
};

test();
