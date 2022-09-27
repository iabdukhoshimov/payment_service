const cfg = require("../../config");

module.exports = {
  isAuthValid: async (req) => {
    const token = req.header("Authorization");

    if (token && token == cfg.paymeToken) {
      return true;
    }

    return false;
  }
};
