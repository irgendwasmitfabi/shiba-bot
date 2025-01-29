const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { ComponentType } = require('discord.js');
const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");
const Profile = require("../../Models/Profile");
const { checkForUserProfile, getUserProfile, giveXPToUser } = require('../../Logic/Utils');
const { checkIfBetIsValid } = require('../../Logic/CasinoUtils');

const fs = require('fs');
const data = fs.readFileSync('./Data/Blackjack/Blackjack.json', 'utf8');
const deck = JSON.parse(data);

const { 
    getBlackJackIdleEmbed, 
    getBlackJackWinEmbed, 
    getBlackJackLoseEmbed, 
    getBlackJackDrawEmbed 
} = require('../../Logic/BlackjackUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Play Blackjack!")
        .addStringOption((option) =>
            option
                .setName("bet")
                .setDescription("The amount you want to bet")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("mode")
                .setDescription("Toggle hard mode (default: Easy Mode)")
                .setRequired(false)
                .addChoices(
                    { name: "Hard Mode", value: "hard" },
                    { name: "Easy Mode", value: "easy" }
                )
        ),
    async execute(interaction) {
        var bet = interaction.options.getString("bet");

        var userExists = await checkForUserProfile(interaction);
        if (!userExists) return;

        var userProfile = await getUserProfile(interaction);

        var isBetValid = await checkIfBetIsValid(interaction, bet, null, userProfile);
        if (!isBetValid) return;

        if (bet === "a" && userProfile.Wallet > 0) {
            bet = userProfile.Wallet;
        }

        var playerCards = getRandomCards(2);
        var dealerCards = getRandomCards(1);

        var playerCardNames = getCardsNames(playerCards);
        var playerValueSum = getCardsSum(playerCards);
        var dealerCard = dealerCards[0];

        var blackjackEmbed = await getBlackJackIdleEmbed(
            interaction.user,
            bet,
            playerCardNames,
            playerValueSum,
            `${dealerCard.name + "🎴"}`
        );

        var buttonRow = getButtonRow();

        var message = await interaction.reply({
            embeds: [blackjackEmbed],
            components: [buttonRow],
        });

        var collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 100_000,
        });

        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }

            var buttonCustomId = buttonInteraction.customId;
            switch (buttonCustomId) {
                case "hitbutton":
                    drawPlayerCard(playerCards);
                    playerCardNames = getCardsNames(playerCards);
                    playerValueSum = getCardsSum(playerCards);

                    if (playerValueSum >= 21) {
                        await buttonInteraction.deferUpdate();
                        return await endGame(playerCards, interaction, dealerCards, bet, userProfile);
                    }

                    blackjackEmbed = await getBlackJackIdleEmbed(
                        interaction.user,
                        bet,
                        playerCardNames,
                        playerValueSum,
                        `${dealerCard.name + "🎴"}`
                    );
                    await interaction.editReply({
                        embeds: [blackjackEmbed],
                        components: [buttonRow],
                    });
                    await buttonInteraction.deferUpdate();
                    break;

                case "standbutton":
                    await endGame(playerCards, interaction, dealerCards, bet, userProfile);
                    await buttonInteraction.deferUpdate();
                    break;
            }
        });
    },
};

async function endGame(playerCards, interaction, dealerCards, bet, userProfile) {
    var playerValueSum = getCardsSum(playerCards);
    var playerCardNames = getCardsNames(playerCards);

    var dealerSum = getCardsSum(dealerCards);

    var playerBust = playerValueSum > 21;
    if (!playerBust) {
        while (dealerSum < 16) {
            var newCard = getRandomCards(1, dealerCards)[0];
            dealerCards.push(newCard);
            dealerSum = getCardsSum(playerCards);
        }
    } else {
        var newCard = getRandomCards(1, dealerCards)[0];
        dealerCards.push(newCard);

        dealerSum = getCardsSum(dealerCards);
    }

    var dealerCardNames = getCardsNames(dealerCards);

    var playerBust = playerValueSum > 21;
    var dealerBust = dealerSum > 21;
    var draw = playerValueSum === dealerSum && !playerBust && !dealerBust;
    var playerWon = !playerBust && (dealerBust || playerValueSum > dealerSum);

    var blackjackEmbed;
    if (draw) {
        blackjackEmbed = await getBlackJackDrawEmbed(
            interaction.user,
            bet,
            playerCardNames,
            playerValueSum,
            dealerCardNames,
            dealerSum,
            userProfile
        );
    } else if (playerWon) {
        blackjackEmbed = await getBlackJackWinEmbed(
            interaction.user,
            bet,
            playerCardNames,
            playerValueSum,
            dealerCardNames,
            dealerSum,
            userProfile
        );

        await giveXPToUser(interaction.user, 10);
        await Profile.updateOne(
            { UserID: interaction.user.id },
            { $inc: { Wallet: bet } }
        );
    } else {
        blackjackEmbed = await getBlackJackLoseEmbed(
            interaction.user,
            bet,
            playerCardNames,
            playerValueSum,
            dealerCardNames,
            dealerSum,
            userProfile
        );

        await giveXPToUser(interaction.user, 5);
        await Profile.updateOne(
            { UserID: interaction.user.id },
            { $inc: { Wallet: -bet } }
        );
    }

    await interaction.editReply({
        embeds: [blackjackEmbed],
        components: []
    });
}

function drawPlayerCard(playerCards) {
    var drawnCard = getRandomCards(1, playerCards)[0];
    playerCards.push(drawnCard);
}

function getButtonRow() {
    var hitButton = new ButtonBuilder()
        .setCustomId("hitbutton")
        .setEmoji("🎯")
        .setStyle(ButtonStyle.Secondary);

    var standButton = new ButtonBuilder()
        .setCustomId("standbutton")
        .setEmoji("⛔")
        .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents([hitButton, standButton]);
}

function getRandomCards(cardAmount, currentCards) {
    try {
        var shuffledDeck = deck.sort(() => Math.random() - 0.5);
        var randomCards = shuffledDeck.slice(0, cardAmount);

        currentCards = currentCards || randomCards;
        var currentCardSum = getCardsSum(currentCards);

        randomCards.forEach(card => {
            if (card.value === 1 && currentCardSum <= 10) {
                card.value = 11;
            }
        });

        return randomCards;
    } catch (error) {
        console.error("Error getting random cards:", error);
        return [];
    }
}

function getCardsSum(cards) {
    return cards.reduce((sum, card) => sum + card.value, 0);
}

function getCardsNames(cards) {
    return cards.map(card => card.name).join(' ');
}