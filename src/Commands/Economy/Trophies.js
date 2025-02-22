const { getDefaultNegativeAnswerEmbed } = require('../../Logic/Embed');
const { getTrophiesEmbed } = require('../../Logic/TrophyUtils');
const { checkForUserProfile } = require('../../Logic/Utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trophies')
		.setDescription('Check your item inventory')
        .addUserOption((option) => option.setName('target').setDescription('The user to check the item inventory from').setRequired(false)),
	async execute(interaction) {
        var userProfile = await checkForUserProfile(interaction);

        if (userProfile.Trophies !== null && userProfile.Trophies.length > 0) {
            var trophyString = userProfile.Trophies.map(trophy => 
                `${trophy.EmojiId} **${trophy.Name}** ${trophy.Amount}x\n\n`
            ).join('');
    
            console.log(userProfile);
            var defaultNeutralAnswerEmbed = await getTrophiesEmbed(
                `Trophy Inventory - ${userProfile.Username}`,
                `${trophyString}`,
                "Aqua",
                interaction.user
            );
    
            await interaction.reply({
                embeds: [defaultNeutralAnswerEmbed]
            });
        } else {
            var defaultNegativeAnswerEmbed = await getDefaultNegativeAnswerEmbed(
                `Trophy Inventory - ${userProfile.Username}`,
                `No trophies in this inventory`,
                interaction.user
            );
    
            await interaction.reply({
                embeds: [defaultNegativeAnswerEmbed]
            });
        }
	},
};
