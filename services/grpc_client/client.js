const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const cfg = require("../../config");
const logger = require("../../config/logger");

const tariffService = () => {
  const PROTO_PATH = __dirname + "/../../protos/tariff_service/subscription.proto";
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  const SubscriptionProto = grpc.loadPackageDefinition(packageDefinition).tariff;

  return new SubscriptionProto.SubscriptionService(
    `${cfg.tariffServiceHost}:${cfg.tariffServicePort}`,
    grpc.credentials.createInsecure()
  );
};

const settingsService = () => {
  const PROTO_PATH = __dirname + "/../../protos/settings_service/settings_service.proto";
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  const SettingsProto = grpc.loadPackageDefinition(packageDefinition).settings;

  return new SettingsProto.SettingService(
    `${cfg.settingsServiceHost}:${cfg.settingsServicePort}`,
    grpc.credentials.createInsecure()
  );
};

const purchaseService = () => {
  const PROTO_PATH = __dirname + "/../../protos/tariff_service/purchase.proto";
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  const PurchaseProto = grpc.loadPackageDefinition(packageDefinition).tariff;

  return new PurchaseProto.PurchaseService(
    `${cfg.tariffServiceHost}:${cfg.tariffServicePort}`,
    grpc.credentials.createInsecure()
  );
}

const subscriptionService = () => {
  const PROTO_PATH = __dirname + "/../../protos/subscription_servcie/subscription_service.proto";
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  const SubscriptionProto = grpc.loadPackageDefinition(packageDefinition).subscription;
  return new SubscriptionProto.UserSubscriptionService(
    `${cfg.subscriptionServiceHost}:${cfg.subscriptionServicePort}`,
    grpc.credentials.createInsecure()
  );
}

let makeActive = (subscription_id, keys) => {
  let keysArray = JSON.parse(keys);
  return new Promise((resolve, reject) => {
    tariffService().MakeActive({ id: subscription_id, keys: keysArray }, (err, response) => {
      if (err) {
        // log the error
        return reject(err);
      }
      return resolve(response);
    });
  });
};

let makeInActive = (subscription_id, keys) => {
  let keysArray = JSON.parse(keys);
  return new Promise((resolve, reject) => {
    tariffService().MakeInActive({ id: subscription_id, keys: keysArray }, (err, response) => {
      if (err) {
        // log the error
        return reject(err);
      }
      return resolve(response);
    });
  });
};

let getSubscriptionByID = (subscription_id) => {
  return new Promise((resolve, reject) => {
    tariffService().GetSubscriptionByID({ id: subscription_id }, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
};

let getPurchaseByID = (purchase_id) => {
  return new Promise((resolve, reject) => {
    purchaseService().GetPurchaseByID({ id: purchase_id }, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
};

let retreiveSettings = (key, lang) => {
  return new Promise((resolve, reject) => {
    settingsService().Get(
      {
        key: key,
        lang: lang
      },
      (err, res) => {
        if (err) {
          logger.error(err);
          return reject(err);
        }

        return resolve(res.setting.value);
      }
    );
  });
};

let makePurchaseActive = (purchase_id) => {
  return new Promise((resolve, reject) => {
    purchaseService().MakePurchaseActive({ purchase_id: purchase_id }, (err, response) => {
      if (err) {
        // log the error
        return reject(err);
      }
      return resolve(response);
    });
  });
};

let makePurchaseCancel = (purchase_id) => {
  return new Promise((resolve, reject) => {
    purchaseService().MakePurchaseCancel({ purchase_id: purchase_id}, (err, response) => {
      if (err) {
        // log the error
        return reject(err);
      }
      return resolve(response);
    });
  });
};

let getUserSubscriptionByID = (purchase_id) => {
  return new Promise((resolve, reject) => {
    subscriptionService().GetUserSubscriptionByID({ id: purchase_id }, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
};

let makePurchaseCancelSvod = (purchase_id) => {
  return new Promise((resolve, reject) => {
    subscriptionService().MakePurchaseCancel({ purchase_id: purchase_id }, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
};

let makePurchaseActiveSvod = (purchase_id) => {
  return new Promise((resolve, reject) => {
    subscriptionService().MakePurchaseActive({ purchase_id: purchase_id }, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
};


module.exports = {
  makeActive,
  makeInActive,
  getSubscriptionByID,
  tariffService,
  retreiveSettings,

  makePurchaseActive,
  makePurchaseCancel,
  getPurchaseByID,

  getUserSubscriptionByID,
  makePurchaseActiveSvod,
  makePurchaseCancelSvod
};
