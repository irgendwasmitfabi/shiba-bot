const { model, Schema } = require('mongoose');
module.exports = model(
  'Profile',
  new Schema({
    CurrentXP: Number,
    GuildID: String,
    lastDaily: Date,
    Level: Number,
    UserID: String,
    Wallet: Number,
    XPForNextLevel: Number,
  })
);