const { SlashCommandBuilder } = require("discord.js");
const Profile = require("../../Models/Profile");
const { createProfile, giveXPToUser } = require('../../Logic/Utils');

const {getCustomColorAnswerEmbed} = require("../../Logic/Embed");

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
