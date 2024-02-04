const { model, Schema } = require('mongoose');
module.exports = model(
  'RPGLevels',
  new Schema({
    Id: Number,
    MaxXP: Number,
  })
);