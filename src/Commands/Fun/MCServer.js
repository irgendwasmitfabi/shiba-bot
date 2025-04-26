const { SlashCommandBuilder } = require('discord.js');
const { getDefaultNegativeAnswerEmbed, getCustomColorAnswerEmbed } = require("../../Logic/Embed");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mcserver')
		.setDescription('Gets you the info for a minecraft server')
		.addStringOption((option) =>
			option
			.setName("server")
			.setDescription("The Server you want to see the info from")
			.setRequired(true)
	),
	async execute(interaction) {
		var choosenServer = interaction.options.getString("server");

		var serverData = await fetch(`https://api.mcsrvstat.us/2/${choosenServer}`)
			.then(res => res.json())
			.then(data => {
				return data;
			})
			.catch(err => console.error("Failed to fetch server info:", err));

		if (!serverData.online) {
			var defaultNeutralAnswerEmbed = await getDefaultNegativeAnswerEmbed(
				`**Server does not exist or is offline**`,
				`Please check the server address`,
				interaction.user
			);

			return await interaction.reply({
				embeds: [defaultNeutralAnswerEmbed]
			});
		}

		var defaultNeutralAnswerEmbed = await getCustomColorAnswerEmbed(
			`**${serverData.motd.clean[0]}**`,
			`**Current Players:** ${serverData.players.online} / ${serverData.players.max}\n`,
			"Green",
			interaction.user
		);

		await interaction.reply({
			embeds: [defaultNeutralAnswerEmbed]
		});
	},
};