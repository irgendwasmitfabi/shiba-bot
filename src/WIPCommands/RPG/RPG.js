var { SlashCommandBuilder } = require("discord.js");
var Profile = require("../../Models/Profile");
var { createProfile, giveXPToUser } = require('../../Logic/Utils');

var {getCustomColorAnswerEmbed} = require("../../Logic/Embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rpg")
        .setDescription("Start your own RPG Adventure!")
        .addStringOption((option) =>
            option
                .setName("prediction")
                .setDescription("Choose the side you think the coin will land")
                .setRequired(true)
                .addChoices(
                    { name: "Heads", value: "heads" },
                    { name: "Tails", value: "tails" }
                )
        ),
    async execute(interaction) {
    },
};
