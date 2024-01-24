const { SlashCommandBuilder } = require('discord.js');
const Profile = require("../../Models/Profile");
const { getUserInformationEmbed, getDefaultNeutralAnswerEmbed } = require("../../Logic/Embed");
const { createProfile } = require('../../Logic/Utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
		.addUserOption((option) => option.setName('target').setDescription('The user to information about').setRequired(false)),
	async execute(interaction) {
		const user = interaction.options.getUser('target') || interaction.user;

        const userProfile = await Profile.find({
            UserID: user.id,
        });

		if (!userProfile.length) {
			if (user !== interaction.user) return interaction.reply(`${user} has no profile.`);
			
            await createProfile(user);

            var profileNotFoundEmbed = await getDefaultNeutralAnswerEmbed(
                "Profile not found",
                `Creating new profile...`
            );

            return await interaction.reply({
                embeds: [profileNotFoundEmbed],
            });
        }

		var userInformationEmbed = await getUserInformationEmbed(user, userProfile[0]);

		return await interaction.reply({
			embeds: [userInformationEmbed],
		});
	},
};