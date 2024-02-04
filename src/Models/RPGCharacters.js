const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGCharacters',
  new Schema({
    UserId: Number,
    Name: String,
    Class: String,
    Level: Number,
    MaxHP: String,
    CurrentXP: Number,
  })
);