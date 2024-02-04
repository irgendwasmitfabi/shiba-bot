const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGLoots',
  new Schema({
    EventId: Number,
    ItemId: Number,
  })
);