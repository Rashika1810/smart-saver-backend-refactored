const crypto = require("crypto");

function hashTransactionId(transactionId) {
  if (!transactionId) return "";

  return crypto
    .createHash("sha256")
    .update(transactionId)
    .digest("hex");
}

module.exports = hashTransactionId;