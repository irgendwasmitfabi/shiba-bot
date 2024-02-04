const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGCharacterStats',
  new Schema({
    CharacterId: Number,
    Charisma: Number,
    Strength: Number,
    Dexterity: Number,
    Stealth: Number,
    MaxHP: Number,
  })
);