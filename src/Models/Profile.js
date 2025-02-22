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
    Trophies: [{ 
      TrophyId: Number,
      Name: String,
      EmojiId: String,
      Amount: Number
    }],
    Businesses: [{ 
      BusinessId: Number,
      Name: String,
      EmojiId: String,
      CurrentProfit: Number,
      Level: Number,
      LastCollected: Date,
      IsMax: Boolean
    }]
  })
);