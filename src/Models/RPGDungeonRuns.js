const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGDungeonRuns',
  new Schema({
    UserId: Number,
    DungeonId: Number,
    DungeonRunId: Number,
    CurrentHP: Number,
  })
);