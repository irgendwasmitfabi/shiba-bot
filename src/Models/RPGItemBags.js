const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGItemBags',
  new Schema({
    UserId: Number,
    ItemId: Number,
  })
);