const { model, Schema } = require('mongoose');

module.exports = model(
  'Trophy',
  new Schema({
    Id: { type: Number, unique: true },
    Name: String,
    EmojiId: String,
    Value: Number,
  })
);
