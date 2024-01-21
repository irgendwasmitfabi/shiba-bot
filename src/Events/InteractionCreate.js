const { Events } = require('discord.js');
const Profile = require("../Models/Profile");
const { getUserLevelUpEmbed } = require("../Logic/Embed");
const { createProfile, checkIfLevelUp, giveXPToUser } = require('../Logic/Utils');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await giveXPToUser(interaction.user, interaction.guild, 2);

			await command.execute(interaction);

			await checkIfUserLeveledUp(interaction);

		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};

async function checkIfUserLeveledUp(interaction) {
	try {
		const result = await checkIfLevelUp(interaction.user, interaction.guild);
		if (result === true) {
			const userProfile = await Profile.find({ UserID: interaction.user.id, GuildID: interaction.guild.id });

			const getUserLevelEmbed = await getUserLevelUpEmbed(
				interaction.user,
				userProfile[0],
			);

			return interaction.followUp({
				embeds: [getUserLevelEmbed],
			});
		}
	} catch (error) {
		console.error(error);
	}
}