const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const MinecraftRecipe = require('../../Models/MinecraftRecipe');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('initializeminecraftrecipes')
		.setDescription('initializes Minecraft Recipes'),
	async execute(interaction) {
        if (interaction.user.id === process.env.adminId) {
            var minecraftRecipes = await MinecraftRecipe.find({});
            var existingRecipeNames = new Set(minecraftRecipes.map((recipe) => recipe.Name));

            var recipeName2ImageUrl = await scrapeMinecraftRecipes(); 
            var recipesToSave = Object.entries(recipeName2ImageUrl).map(([recipeName, imageURL]) => ({
                Name: recipeName,
                ImgURL: imageURL,
            }));

            var uniqueRecipesToSave = recipesToSave.filter((recipe, index, self) =>
                index === self.findIndex((r) => r.Name === recipe.Name)
            );
            
            var newRecipes = uniqueRecipesToSave.filter((recipe) => !existingRecipeNames.has(recipe.Name));
            try {
                await MinecraftRecipe.insertMany(newRecipes);
            } catch(error) {
                console.log(error);
            }
            
            await interaction.reply('Created Minecraft Recipes!');
        } else {
            await interaction.reply('You dont have the permission!');
        }
	},
};

async function scrapeMinecraftRecipes() {
    try {
        var response = await axios.get('https://www.minecraftcrafting.info/');
        var htmlContent = response.data;

        var $ = cheerio.load(htmlContent);

        var firstTable = $('table').first();
        var secondRow = firstTable.find('tr').eq(1);
        var firstColumn = secondRow.find('td').first();
        var recipeTables = firstColumn.find('table');

        var recipeName2ImageUrl = {};
        recipeTables.each((tableIndex, table) => {
            // Get all rows in the table except the first one
            var rows = $(table).find('tr:gt(0)');
            rows.each((rowIndex, row) => {

                var recipeName = $(row).find('td:first-child').text().trim();
                var imageURL = "https://www.minecraftcrafting.info/" + $(row).find('td:nth-child(3) img').attr('src');

                recipeName2ImageUrl[recipeName] = imageURL;
            });
        });

        return recipeName2ImageUrl;
    } catch (error) {
        console.error('Error fetching or processing tables:', error.message);
    }
}
