const { statuses } = require("../../utils/state_constants");

module.exports = {
  timeExpired: 43200000,

  PAYME_STATES: {
    STATE_IN_PROGRESS: 1,
    STATE_DONE: 2,
    STATE_CANCELED: -1,
    STATE_POST_CANCELED: -2
  }
};

module.exports.mapStateToWord = (number) => {
  let response;
  switch (number) {
    case 1:
      response = statuses.filter((elem) => elem == "pending");
      break;
    case 2:
      response = statuses.filter((elem) => elem == "success");
      break;
    case -1:
      response = statuses.filter((elem) => elem == "cancelled");
      break;
    case -2:
      response = statuses.filter((elem) => elem == "cancelled");
      break;
    default:
      response = ["initial"];
      break;
  }
  return response[0] || "initial";
};

module.exports.mapClickStatus = (str) => {
  let response;
  switch (str) {
    case "WAITING":
      response = statuses.filter((elem) => elem == "pending");
      break;
    case "CONFIRMED":
      response = statuses.filter((elem) => elem == "success");
      break;
    case "REJECTED":
      response = statuses.filter((elem) => elem == "cancelled");
      break;
    default:
      response = ["initial"];
      break;
  }
  return response[0] || "initial";
};

