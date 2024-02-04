const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGDungeonEvents',
  new Schema({
    DungeonId: Number,
    EventId: Number,
  })
);