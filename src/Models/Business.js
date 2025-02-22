const { model, Schema } = require('mongoose');

module.exports = model(
  'Business',
  new Schema({
    Id: { type: Number, unique: true },
    Name: String,
    EmojiId: String,
    Price: Number,
    Levels: [{ 
        Level: Number,
        Profit: Number,
        UpgradePrice: Number,
        IsMax: Boolean
    }],
  })
);
