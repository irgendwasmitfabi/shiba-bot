const { SlashCommandBuilder } = require("discord.js");
const Profile = require("../../Models/Profile");
const { checkForUserProfile, getUserProfile, giveXPToUser } = require('../../Logic/Utils');
const { checkIfBetIsValid } = require('../../Logic/CasinoUtils');

const {
    getCustomColorAnswerEmbed,
    getDefaultWinEmbed,
    getDefaultLoseEmbed,
} = require("../../Logic/Embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sevens")
        .setDescription("Play a game of sevens")
        .addStringOption((option) =>
            option
                .setName("prediction")
                .setDescription("Choose the side you think the coin will land")
                .setRequired(true)
                .addChoices(
                    { name: "High", value: "high" },
                    { name: "7", value: "7" },
                    { name: "Low", value: "low" }
                )
        )
        .addStringOption((option) =>
            option
                .setName("bet")
                .setDescription("The amount you want to bet")
                .setRequired(true)
        ),
    async execute(interaction) {
        const sevenMultiplier = 10;

        var prediction = interaction.options.getString("prediction");
        var bet = interaction.options.getString("bet");
        
        var userExists = await checkForUserProfile(interaction);
        if (!userExists) {
            return;
        }

        var isBetValid = await checkIfBetIsValid(interaction, bet);
        if (!isBetValid) return;

        var userProfile = await getUserProfile(interaction);

        if (bet === "a" && userProfile.Wallet > 0) {
            bet = userProfile.Wallet;
        }
        
        var rolledNumber = Math.floor(Math.random() * 12) + 1;

        var sevensEmbed = await getCustomColorAnswerEmbed(
            "Sevens",
            `You could not play`,
            "Orange",
            interaction.user
        );

        if (bet > userProfile.Wallet) {
            var notEnoughCoinsEmbed = await getCustomColorAnswerEmbed(
                "Sevens",
                `You don't have enough :coin:`,
                "Red",
                interaction.user
            );

            return await interaction.reply({
                embeds: [notEnoughCoinsEmbed],
            });
        }

        var result = rolledNumber < 7 ? "low" : rolledNumber > 7 ? "high" : "7";

        if (prediction === result) {
            var win = bet;

            if (result === "7") {
                win = bet * sevenMultiplier;
            }

            await Profile.updateOne(
                { UserID: interaction.user.id },
                { $inc: { Wallet: win } }
            );

            sevensEmbed = await getDefaultWinEmbed(
                "Sevens",
                bet,
                `**Your bet:** \n${prediction}\n
                **Ball landed on:**\n${rolledNumber}`,
                win,
                userProfile.Wallet,
                interaction.user
            );

            await giveXPToUser(interaction.user, 10);
        } else {
            await Profile.updateOne(
                { UserID: interaction.user.id },
                { $inc: { Wallet: -bet } }
            );

            sevensEmbed = await getDefaultLoseEmbed(
                "**Sevens**",
                bet,
                `**Your bet:** \n${prediction}\n
                **Ball landed on:**\n${rolledNumber}`,
                bet,
                userProfile.Wallet,
                interaction.user
            );

            await giveXPToUser(interaction.user, 5);
        }

        await interaction.reply({
            embeds: [sevensEmbed],
        });
    },
};