const { getDefaultNeutralAnswerEmbed } = require('../../Logic/Embed');
const { checkForUserProfile } = require('../../Logic/Utils');
const { SlashCommandBuilder } = require('discord.js');

const formatter = new Intl.NumberFormat('us-US');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wallet')
		.setDescription('Check your wallet')
        .addUserOption((option) => option.setName('target').setDescription('The user to see the Wallet from').setRequired(false)),
	async execute(interaction) {
        var userProfile = await checkForUserProfile(interaction);

        var defaultNeutralAnswerEmbed = await getDefaultNeutralAnswerEmbed(
            `**Wallet** - ${userProfile.Username}`,
            `**Wallet:** ${formatter.format(userProfile.Wallet)} :coin:\n **Bank:** ${formatter.format(userProfile.Bank)} :coin:`
        );

        await interaction.reply({
            embeds: [defaultNeutralAnswerEmbed]
        });
	},
};

