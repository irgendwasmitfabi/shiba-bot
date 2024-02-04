const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGDungeons',
  new Schema({
    Id: Number,
    Difficulty: Number,
    Name: String,
  })
);