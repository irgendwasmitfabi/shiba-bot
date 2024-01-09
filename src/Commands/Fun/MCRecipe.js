const { SlashCommandBuilder } = require('discord.js');
const MinecraftRecipe = require("../../Models/MinecraftRecipe");
const { getDefaultNegativeAnswerEmbed, getMinecraftRecipeEmbed } = require("../../Logic/Embed");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mcrecipe')
		.setDescription('Gets you the minecraft recipe to an item')
		.addStringOption((option) =>
			option
			.setName("recipe")
			.setDescription("The Recipe you want to see")
			.setRequired(true)
	),
	async execute(interaction) {
		var choosenRecipe = interaction.options.getString("recipe");

		const minecraftRecipe = await MinecraftRecipe.find({ Name: { $regex: new RegExp(choosenRecipe, 'i') } });
		if (!minecraftRecipe[0]) {
			var recipeNameNotValidEmbed = await getDefaultNegativeAnswerEmbed(
                ":x: Recipe not found",
                `The Recipe could not be found`
            );

            return await interaction.reply({
                embeds: [recipeNameNotValidEmbed],
            });
		} else {
			var recipeEmbed = await getMinecraftRecipeEmbed(
				minecraftRecipe[0].Name,
				minecraftRecipe[0].ImgURL
            );
			return await interaction.reply({
                embeds: [recipeEmbed],
            });
		}
	},
};