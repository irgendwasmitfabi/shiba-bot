const { SlashCommandBuilder } = require("discord.js");
const Profile = require("../../Models/Profile");
const {
    getCustomColorAnswerEmbed,
    getDefaultNeutralAnswerEmbed,
    getDefaultWinEmbed,
    getDefaultLoseEmbed,
    getDefaultNegativeAnswerEmbed
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
        
        if (isNaN(bet) && bet !== "a") {
            var betNotValid = await getDefaultNegativeAnswerEmbed(
                ":x: Bet not valid",
                `Please enter a valid bet`
            );

            return await interaction.reply({
                embeds: [betNotValid],
            });
        }

        const guild = interaction.guild;
        const user = interaction.user;
        const userProfile = await Profile.find({
            UserID: user.id,
            GuildID: guild.id,
        });

        if (bet === "a" && userProfile[0].Wallet > 0) {
            bet = userProfile[0].Wallet;
        }
        
        let flip = Math.floor(Math.random() * 2);
        let result = flip == 0 ? "heads" : "tails";

        var coinflipEmbed = await getCustomColorAnswerEmbed(
            "Coin Flip",
            `You could not flip a coin`,
            "Orange",
            interaction.user
        );

        if (!userProfile.length) {
            await createProfile(interaction.user, interaction.guild);

            var profileNotFoundEmbed = await getDefaultNeutralAnswerEmbed(
                "Profile not found",
                `Creating new profile...`
            );

            return await interaction.reply({
                embeds: [profileNotFoundEmbed],
            });
        } else if (bet <= userProfile[0].Wallet) {

            if (prediction === result) {
                await Profile.updateOne(
                    { UserID: interaction.user.id, GuildID: guild.id },
                    { $inc: { Wallet: bet } }
                );

                coinflipEmbed = await getDefaultWinEmbed(
                    "Coin Flip",
                    bet,
                    `You bet on: \n${prediction}\nCoin landed on: \n${result}`,
                    bet,
                    userProfile[0].Wallet,
                    interaction.user
                );
            } else {
                await Profile.updateOne(
                    { UserID: interaction.user.id, GuildID: guild.id },
                    { $inc: { Wallet: -bet } }
                );

                coinflipEmbed = await getDefaultLoseEmbed(
                    "Coin Flip",
                    bet,
                    `You bet on: \n${prediction}\nCoin landed on: \n${result}`,
                    bet,
                    userProfile[0].Wallet,
                    interaction.user
                );
            }
        } else {
            coinflipEmbed = await getCustomColorAnswerEmbed(
                "Coin Flip",
                `You dont have enough money!`,
                "Red",
                interaction.user
            );
        }

        await interaction.reply({
            embeds: [coinflipEmbed],
        });
    },
};
