const { getDefaultNeutralAnswerEmbed } = require('../../Logic/Embed');
const { checkForUserProfile, getUserProfile } = require('../../Logic/Utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wallet')
		.setDescription('Check your wallet')
        .addUserOption((option) => option.setName('target').setDescription('The user to see the Wallet from').setRequired(false)),
	async execute(interaction) {
        var userExists = await checkForUserProfile(interaction);
        if (!userExists) {
            return;
        }
    
        var userProfile = await getUserProfile(interaction);

        var defaultNeutralAnswerEmbed = await getDefaultNeutralAnswerEmbed(
            "Wallet",
            `**Wallet:** ${userProfile.Wallet} :coin:\n **Bank:** ${userProfile.Bank} :coin:`
        );

        await interaction.reply({
            embeds: [defaultNeutralAnswerEmbed]
        });
	},
};

