const config = {
  environment: getConf("NODE_ENV", "dev"),

  maxAllowedUsers: getConf("MAX_USERS", 3),

  mongoHost: getConf("MONGO_HOST", "localhost"),
  mongoPort: getConf("MONGO_PORT", "27017"),
  mongoUser: getConf("MONGO_USER", "payment_service"),
  mongoPassword: getConf("MONGO_PASSWORD", "mongo-passs"),
  mongoDatabase: getConf("MONGO_DATABASE", "payment_service"),

  RPCPort: getConf("RPC_PORT", 6061),
  HTTPPort: getConf("HTTP_PORT", 3000),

  tariffServiceHost: getConf("TARIFF_SERVICE_HOST", "localhost"),
  tariffServicePort: getConf("TARIFF_SERVICE_PORT", 6060),

  settingsServiceHost: getConf("SETTINGS_SERVICE_HOST", "settings_service"),
  settingsServicePort: getConf("SETTINGS_SERVICE_PORT", 7003),

  subscriptionServiceHost: getConf("SUBSCRIPTION_SERVICE_HOST", "subscription_service"),
  subscriptionServicePort: getConf("SUBSCRIPTION_SERVICE_PORT", 5006),

  paymeToken: `Basic ${getConf("PAYME_TOKEN","UGF5Y29tOlV6Y2FyZDpzb21lUmFuZG9tU3RyaW5nMTU0NTM0MzU0MzU0NQ==")}`,
  paymeId: getConf("PAYME_ID", "61d9245a94e58c782a460bba"),
  paymeCheckoutURL: getConf("PAYME_CHECKOUT_URL", "https://checkout.paycom.uz/"),
  paymeRedirectURL: getConf("PAYME_REDIRECT_URL", "https://test.editory.udevs.io.tv/"),

  cloudUrl: getConf("CLOUD_URL", "https://editory-cdn.s3.eu-north-1.amazonaws.com/movies/images/"),
  cloudUrlVideo: getConf("CLOUD_URL_VIDEO", "https://editory-cdn.s3.eu-north-1.amazonaws.com/movies/sd/"),
  cloudUrlHdVideo: getConf("CLOUD_URL_HD_VIDEO", "https://editory-cdn.s3.eu-north-1.amazonaws.com/movies/hd/"),

  clickCheckoutURL: getConf("CLICK_CHECKOUT_URL", "https://my.click.uz/services/pay"),
  clickServiceId: getConf("CLICK_SERVICE_ID", "1"),
  clickMerchantId: getConf("CLICK_MERCHANT_ID", "2"),
  clickSecretKey: getConf("CLICK_SECRET_KEY", "3"),

  lang: getConf("DEFAULT_LANG", "ru")
};

function getConf(name, def = "") {
  if (process.env[name]) {
    return process.env[name];
  }
  return def;
}

module.exports = config;
