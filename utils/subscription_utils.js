let parseSubscriptionPrice = (tariffs, keys) => {
  let amount = 0;

  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < tariffs.length; j++) {
      if (tariffs[j].key == keys[i]) {
        amount += getAmountFromPrices(tariffs[j].tariff.prices, tariffs[j].duration);
      }
    }
  }

  return amount;
};

let parseSubscriptionPriceForClick = (tariffs, keys) => {
  let amount = 0;
  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < tariffs.length; j++) {
      if (tariffs[j].key == keys[i]) {
        amount += getAmountFromPrices(tariffs[j].prices, tariffs[j].duration);
      }
    }
  }

  return amount;
};


let getAmountFromPrices = (prices, duration) => {

  for (let i = 0; i < prices.length; i++) {
    if (prices[i].duration == duration) {
      return prices[i].price;
    }
  }
};

let parseTariffsInfo = (tariffs, keys) => {
  let result = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < tariffs.length; j++) {
      if (tariffs[j].key == keys[i]) {
        result.push({ tariff_id: tariffs[j].tariff.id, duration: tariffs[j].duration, key: tariffs[j].key, prices: tariffs[j].tariff.prices });
      }
    }
  }
  return result;
};

module.exports = { parseSubscriptionPrice, parseTariffsInfo, parseSubscriptionPriceForClick };
