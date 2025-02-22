const { SlashCommandBuilder } = require('discord.js');
const { getUserInformationEmbed } = require("../../Logic/Embed");
const { checkForUserProfile } = require('../../Logic/Utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
		.addUserOption((option) => option.setName('target').setDescription('The user to see information about').setRequired(false)),
	async execute(interaction) {
        var userProfile = await checkForUserProfile(interaction);
        
		var userInformationEmbed = await getUserInformationEmbed(interaction.user, userProfile);

		return await interaction.reply({
			embeds: [userInformationEmbed],
		});
	},
};