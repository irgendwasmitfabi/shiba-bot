const { SlashCommandBuilder } = require("discord.js");
const Profile = require("../../Models/Profile");
const { checkForUserProfile, giveXPToUser } = require('../../Logic/Utils');
const { checkIfBetIsValid } = require('../../Logic/CasinoUtils');

const {
    getCustomColorAnswerEmbed,
    getDefaultWinEmbed,
    getDefaultLoseEmbed,
} = require("../../Logic/Embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Flip a coin!")
        .addStringOption((option) =>
            option
                .setName("prediction")
                .setDescription("Choose the side you think the coin will land")
                .setRequired(true)
                .addChoices(
                    { name: "Heads", value: "heads" },
                    { name: "Tails", value: "tails" }
                )
        )
        .addStringOption((option) =>
            option
                .setName("bet")
                .setDescription("The amount you want to bet")
                .setRequired(true)
        ),
    async execute(interaction) {
        var prediction = interaction.options.getString("prediction");
        var bet = interaction.options.getString("bet");
        
        var userProfile = await checkForUserProfile(interaction);
        
        var isBetValid = await checkIfBetIsValid(interaction, bet);
        if (!isBetValid) return;

        if (bet === "a" && userProfile.Wallet > 0) {
            bet = userProfile.Wallet;
        }
        
        var flip = Math.floor(Math.random() * 2);
        var result = flip == 0 ? "heads" : "tails";

        var coinflipEmbed = await getCustomColorAnswerEmbed(
            "Coin Flip",
            `You could not flip a coin`,
            "Orange",
            interaction.user
        );

        if (bet > userProfile.Wallet) {
            var notEnoughCoinsEmbed = await getCustomColorAnswerEmbed(
                "Coin Flip",
                `You dont have enough :coin:`,
                "Red",
                interaction.user
            );

            return await interaction.reply({
                embeds: [notEnoughCoinsEmbed],
            });
        }

        if (prediction === result) {
            await Profile.updateOne(
                { UserID: interaction.user.id },
                { $inc: { Wallet: bet } }
            );

            coinflipEmbed = await getDefaultWinEmbed(
                "Coin Flip",
                bet,
                `You bet on: \n${prediction}\nCoin landed on: \n${result}`,
                bet,
                userProfile.Wallet,
                interaction.user
            );
            await giveXPToUser(interaction.user, 10);
        } else {
            await Profile.updateOne(
                { UserID: interaction.user.id },
                { $inc: { Wallet: -bet } }
            );

            coinflipEmbed = await getDefaultLoseEmbed(
                "Coin Flip",
                bet,
                `You bet on: \n${prediction}\nCoin landed on: \n${result}`,
                bet,
                userProfile.Wallet,
                interaction.user
            );

            await giveXPToUser(interaction.user, 5);
        }

        await interaction.reply({
            embeds: [coinflipEmbed],
        });
    },
};