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
            const recipeName2ImageUrl = await scrapeMinecraftRecipes(); 

            const recipesToSave = Object.entries(recipeName2ImageUrl).map(([recipeName, imageURL]) => ({
                Name: recipeName,
                ImgURL: imageURL,
            }));
            const uniqueRecipesToSave = recipesToSave.filter((recipe, index, self) =>
                index === self.findIndex((r) => r.Name === recipe.Name)
            );
            
            try{
                await MinecraftRecipe.insertMany(uniqueRecipesToSave);
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
        const response = await axios.get('https://www.minecraftcrafting.info/');
        const htmlContent = response.data;

        const $ = cheerio.load(htmlContent);

        const firstTable = $('table').first();
        const secondRow = firstTable.find('tr').eq(1);
        const firstColumn = secondRow.find('td').first();
        const recipeTables = firstColumn.find('table');

        var recipeName2ImageUrl = {};
        recipeTables.each((tableIndex, table) => {
            // Get all rows in the table except the first one
            const rows = $(table).find('tr:gt(0)');
            rows.each((rowIndex, row) => {

                const recipeName = $(row).find('td:first-child').text().trim();
                const imageURL = "https://www.minecraftcrafting.info/" + $(row).find('td:nth-child(3) img').attr('src');

                recipeName2ImageUrl[recipeName] = imageURL;
            });
        });

        return recipeName2ImageUrl;
    } catch (error) {
        console.error('Error fetching or processing tables:', error.message);
    }
}
