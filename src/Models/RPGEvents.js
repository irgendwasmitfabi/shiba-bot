const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGEvents',
  new Schema({
    Id: Number,
    Difficulty: String,
    Name: String,
    Description: String,
    Type: String,
  })
);