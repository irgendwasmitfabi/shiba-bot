var { model, Schema } = require('mongoose');
module.exports = model(
  'RPGClasses',
  new Schema({
    Id: Number,
    Name: String,
    Charisma: Number,
    Strength: Number,
    Dexterity: Number,
    Stealth: Number,
  })
);