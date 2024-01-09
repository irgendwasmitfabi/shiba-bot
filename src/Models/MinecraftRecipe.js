const { model, Schema } = require('mongoose');

const minecraftRecipeSchema = new Schema({
  Name: { type: String, unique: true },
  ImgURL: String,
});

minecraftRecipeSchema.index({ Name: 1 }, { unique: true });

module.exports = model('MinecraftRecipe', minecraftRecipeSchema);
