const { SlashCommandBuilder } = require("discord.js");
const { createProfile, giveXPToUser } = require('../../Logic/Utils');
const Profile = require("../../Models/Profile");
const {
    getCustomColorAnswerEmbed,
    getDefaultNeutralAnswerEmbed,
    getDefaultWinEmbed,
    getDefaultLoseEmbed,
    getDefaultDrawEmbed,
    getDefaultNegativeAnswerEmbed,
} = require("../../Logic/Embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription("Try your luck at the Slot Machine!")
        .addStringOption((option) =>
            option
                .setName("bet")
                .setDescription("The amount you want to bet (Type `a` to go all in)")
                .setRequired(true)
        ),
    async execute(interaction) {
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

        if (bet < 100 ) {
            var betNotValid = await getDefaultNegativeAnswerEmbed(
                ":x: Bet not valid",
                `The minimum bet for this game is 100!`
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

        var slotsEmbed = await getCustomColorAnswerEmbed(
            "Slots",
            `The Machine is not working properly`,
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
            const showItems = [
                { name: "🍒", value: 1, mult: 0.1 },
                { name: "🍋", value: 5, mult: 0 },
                { name: "🍇", value: 9, mult: 0.5 },
                { name: ":star:", value: 12, mult: 1 },
                { name: "🍒", value: 1, mult: 0.1 },
                { name: "🍋", value: 5, mult: 0 },
                { name: "🍇", value: 9, mult: 0.5 },
                { name: ":star:", value: 12, mult: 1 },
                { name: "🍒", value: 1, mult: 0.1 },
                { name: "🍋", value: 5, mult: 0 },
                { name: "🍇", value: 9, mult: 0.5 },
                { name: ":star:", value: 12, mult: 1 },
            ];
            const items = [
                { name: "🍒", value: 1, mult: 0.1 },
                { name: "🍒", value: 2, mult: 0.1 },
                { name: "🍒", value: 3, mult: 0.1 },
                { name: "🍒", value: 4, mult: 0.1 },
                { name: "🍒", value: 4, mult: 0.1 },
                { name: "🍒", value: 4, mult: 0.1 },
                { name: "🍒", value: 4, mult: 0.1 },
                //{ name: "🍋", value: 5, mult: 0 },
                //{ name: "🍋", value: 6, mult: 0 },
                //{ name: "🍋", value: 7, mult: 0 },
                //{ name: "🍋", value: 8, mult: 0 },
                //{ name: "🍋", value: 8, mult: 0 },
                //{ name: "🍇", value: 9, mult: 0.5 },
                //{ name: "🍇", value: 10, mult: 0.5 },
                //{ name: "🍇", value: 11, mult: 0.5 },
                //{ name: "🍇", value: 11, mult: 0.5 },
                //{ name: ":star:", value: 12, mult: 1 },
                //{ name: ":star:", value: 13, mult: 1 },
                //{ name: ":star:", value: 13, mult: 1 },
            ];

            slotsEmbed = await getCustomColorAnswerEmbed("Slots", `Spin!`, "Gold", interaction.user);

            let slotTop1 = items[Math.floor(Math.random() * items.length)];
            let slotTop2 = items[Math.floor(Math.random() * items.length)];
            let slotTop3 = items[Math.floor(Math.random() * items.length)];

            await interaction.reply({
                embeds: [slotsEmbed],
            });

            //create animation
            for (let i = 2; i < 12; i++) {
                var updatedSlotsEmbed = await getCustomColorAnswerEmbed(
                    "Slots",
                    `${showItems[i].name} ${showItems[i].name} ${showItems[i].name}`,
                    "Gold",
                    interaction.user);

                await interaction.editReply({ embeds: [updatedSlotsEmbed] });
            }

            let results = [slotTop1, slotTop2, slotTop3];
            let result = 0;
            results.forEach((slot) => {
                (result += slot.mult);
            });

            var multiplier = Math.round(result * 100) / 100;

            win = bet * multiplier;
            
            win = Math.round(win * 100) / 100;
            bet = Math.round(bet * 100) / 100;

            if (win > bet) {
                await Profile.updateOne(
                    { UserID: interaction.user.id, GuildID: guild.id },
                    { $inc: { Wallet: -bet } }
                );
                await Profile.updateOne(
                    { UserID: interaction.user.id, GuildID: guild.id },
                    { $inc: { Wallet: win } }
                  );

                slotsEmbed = await getDefaultWinEmbed(
                    "Slots",
                    bet,
                    `${slotTop1.name} ${slotTop2.name} ${slotTop3.name}\n
                    Multiplier: ${multiplier}`,
                    win - bet,
                    userProfile[0].Wallet,
                    interaction.user
                );

                await giveXPToUser(interaction.user, interaction.guild, 10);
            } else if(multiplier == 1) {
                slotsEmbed = await getDefaultDrawEmbed(
                    "Slots",
                    bet,
                    `${slotTop1.name} ${slotTop2.name} ${slotTop3.name}\n
                    Multiplier: ${multiplier}`,
                    userProfile[0].Wallet,
                    interaction.user
                );

                await giveXPToUser(interaction.user, interaction.guild, 5);
            } else if(multiplier < 1) {
                await Profile.updateOne(
                    { UserID: interaction.user.id, GuildID: guild.id },
                    { $inc: { Wallet: win-bet } }
                  );

                slotsEmbed = await getDefaultLoseEmbed(
                    "Slots",
                    bet,
                    `${slotTop1.name} ${slotTop2.name} ${slotTop3.name}\n
                    Multiplier: ${multiplier}`,
                    bet - win,
                    userProfile[0].Wallet,
                    interaction.user
                );

                await giveXPToUser(interaction.user, interaction.guild, 5);
            }
        } else {
            slotsEmbed = await getCustomColorAnswerEmbed(
                "Slots",
                `You dont have enough money!`,
                "Red",
                interaction.user
            );

            return await interaction.reply({
                embeds: [slotsEmbed],
            });
        }

        await interaction.editReply({
            embeds: [slotsEmbed],
        });
    },
};
