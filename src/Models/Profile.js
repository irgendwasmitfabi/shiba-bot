const { model, Schema } = require('mongoose');
module.exports = model(
  'Profile',
  new Schema({
    Bank: Number,
    CurrentXP: Number,
    LastDaily: Date,
    Level: Number,
    UserID: String,
    Username: String,
    Wallet: Number,
    XPForNextLevel: Number,
  })
);