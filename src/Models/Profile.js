const { model, Schema } = require('mongoose');
module.exports = model(
  'Profile',
  new Schema({
    CurrentXP: Number,
    lastDaily: Date,
    Level: Number,
    UserID: String,
    Wallet: Number,
    XPForNextLevel: Number,
  })
);