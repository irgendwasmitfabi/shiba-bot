var { SlashCommandBuilder } = require("discord.js");
var RPGCharacters = require("../../Models/Profile");
var { createProfile, giveXPToUser } = require('../../Logic/Utils');

var {getCreateCharacterEmbed} = require("../../Logic/RPG/Embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rpg-start")
        .setDescription("Start Your Own RPG Adventure"),
    async execute(interaction) {
        var userId = interaction.user.id;

        var character = await RPGCharacters.find({
            UserID: userId,
        });

        if (!character.length) {
            var createCharacterEmbed = await getCreateCharacterEmbed();

            return await interaction.reply({
                embeds: [createCharacterEmbed],
            });
        }
    },
};
