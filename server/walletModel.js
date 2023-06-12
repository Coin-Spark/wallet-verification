const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  wallet: String, // replace with actual schema
  verifiedWallet: { type: Boolean, default: false },
  signHash: String,
});

module.exports = mongoose.model("Wallet", walletSchema);
