const { getDefaultNeutralAnswerEmbed } = require('../../Logic/Embed');
const { createProfile } = require('../../Logic/Utils');
const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../Models/Profile');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wallet')
		.setDescription('Check your wallet')
        .addUserOption((option) => option.setName('target').setDescription('The user to see the Wallet from').setRequired(false)),
	async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;

        const userProfile = await Profile.find({ UserID: user.id });

        if (!userProfile.length) {
            if (user !== interaction.user) return interaction.reply(`${user} has no profile.`);

            await createProfile(interaction.user);

            var profileNotFoundEmbed = await getDefaultNeutralAnswerEmbed(
                "Profile not found",
                `Creating new profile...`
            );

            await interaction.reply({
                embeds: [profileNotFoundEmbed]
            });
        } else {
            var defaultNeutralAnswerEmbed = await getDefaultNeutralAnswerEmbed(
                "Wallet",
                `**Wallet:** ${userProfile[0].Wallet} :coin:`
            );

            await interaction.reply({
                embeds: [defaultNeutralAnswerEmbed]
            });
        }
	},
};

