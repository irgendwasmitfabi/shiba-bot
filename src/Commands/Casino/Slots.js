const { SlashCommandBuilder } = require("discord.js");
const { checkForUserProfile, giveXPToUser } = require('../../Logic/Utils');
const { checkIfBetIsValid } = require('../../Logic/CasinoUtils');
const Profile = require("../../Models/Profile");
const {
    getCustomColorAnswerEmbed,
    getDefaultWinEmbed,
    getDefaultLoseEmbed,
    getDefaultDrawEmbed,
    getSlotsIdleEmbed
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
        const minimumBet = 10;

        var userProfile = await checkForUserProfile(interaction);
        
        var bet = interaction.options.getString("bet");

        var isBetValid = await checkIfBetIsValid(interaction, bet, minimumBet, userProfile);
        if (!isBetValid) return;

        if (bet === "a" && userProfile.Wallet > minimumBet) {
            bet = userProfile.Wallet;
        }

        var slotsEmbed = await getCustomColorAnswerEmbed(
            "Slots",
            `The Machine is not working properly`,
            "Orange",
            interaction.user
        );

        if (bet <= userProfile.Wallet) {
            const items = [
                { name: "<:cherry:1338237224126255165>", mult: 0.1, weight: 40 },
                { name: "<:blueFruit:1338237246872227851>", mult: 0, weight: 30 },
                { name: "<:purpleFruit:1338237282477670443>", mult: 0.5, weight: 20 },
                { name: "<:starFruit:1338237375234576384>", mult: 1, weight: 10 },
            ];

            var animatedSlotsEmbed = await getSlotsIdleEmbed(
                bet,
                interaction.user
            );

            await interaction.reply({ embeds: [animatedSlotsEmbed] });

            await new Promise(resolve => setTimeout(resolve, 2000));

            var slotTop1 = getRandomItem(items);
            var slotTop2 = getRandomItem(items);
            var slotTop3 = getRandomItem(items);

            var results = [slotTop1, slotTop2, slotTop3];
            var result = 0;
            results.forEach((slot) => {
                (result += slot.mult);
            });

            var multiplier = Math.round(result * 100) / 100;

            win = bet * multiplier;
            
            win = parseInt((Math.round(win * 100) / 100), 10);
            bet = Math.round(bet * 100) / 100;

            if (win > bet) {
                await updateWallet(interaction.user.id, -bet);
                await updateWallet(interaction.user.id, win);
            
                slotsEmbed = await getSlotsEmbed("win", bet, `${slotTop1.name} ${slotTop2.name} ${slotTop3.name}`, multiplier, win, userProfile.Wallet, interaction.user);
                await giveXPToUser(interaction.user, 10);
            } else if (multiplier == 1) {
                slotsEmbed = await getSlotsEmbed("draw", bet, `${slotTop1.name} ${slotTop2.name} ${slotTop3.name}`, multiplier, 0, userProfile.Wallet, interaction.user);
                await giveXPToUser(interaction.user, 5);
            } else if (multiplier < 1) {
                await updateWallet(interaction.user.id, win - bet);
            
                slotsEmbed = await getSlotsEmbed("lose", bet, `${slotTop1.name} ${slotTop2.name} ${slotTop3.name}`, multiplier, win, userProfile.Wallet, interaction.user);
                await giveXPToUser(interaction.user, 5);
            } else {
                slotsEmbed = await getCustomColorAnswerEmbed("Slots", "You don't have enough :coin:!", "Red", interaction.user);
                return await interaction.reply({ embeds: [slotsEmbed] });
            }
        }

        await interaction.editReply({
            embeds: [slotsEmbed],
        });
    },
};

function getRandomItem(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const item of items) {
        if (randomWeight < item.weight) {
            return item;
        }
        randomWeight -= item.weight;
    }
}

async function updateWallet(userId, amount) {
    await Profile.updateOne(
        { UserID: userId },
        { $inc: { Wallet: amount } }
    );
}

async function getSlotsEmbed(type, bet, slotNames, multiplier, win, userWallet, user) {
    var message = `${slotNames}\nMultiplier: ${multiplier}`;
    var wonAmount = win - bet;
    var lostAmount = bet - win;

    switch (type) {
        case "win":
            return await getDefaultWinEmbed("Slots", bet, message, wonAmount, userWallet, user);
        case "draw":
            return await getDefaultDrawEmbed("Slots", bet, message, userWallet, user);
        case "lose":
            return await getDefaultLoseEmbed("Slots", bet, message, lostAmount, userWallet, user);
        default:
            throw new Error("Unknown slot type");
    }
}