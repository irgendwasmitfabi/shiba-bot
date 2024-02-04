const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGItems',
  new Schema({
    Id: Number,
    Name: String,
    Description: String,
    Type: String,
    DropChance: Int, //float?
    Rarity: String,
    ClassType: String,
  })
);