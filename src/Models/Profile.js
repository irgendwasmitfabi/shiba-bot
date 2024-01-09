const { model, Schema } = require('mongoose');
module.exports = model(
  'Profile',
  new Schema({
    GuildID: String,
    UserID: String,
    Wallet: Number,
    lastDaily: Date,
  })
);