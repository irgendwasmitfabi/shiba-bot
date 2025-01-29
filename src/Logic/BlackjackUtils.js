const { EmbedBuilder } = require('discord.js');

module.exports = {
    getBlackJackIdleEmbed: async function getBlackJackIdleEmbed(user, bet, playerCards, value, dealerCards) {
        return new EmbedBuilder()
            .setTitle("Blackjack")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                **Your Hand**
                ${playerCards} - ${value}\n
                **Dealer Hand**
                ${dealerCards}`)
            .setColor("DarkAqua")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getBlackJackWinEmbed: async function getBlackJackWinEmbed(user, bet, playerCards, value, dealerCards, dealerSum, userProfile) {
        return new EmbedBuilder()
            .setTitle("Blackjack - You Won!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                **Your Hand**
                ${playerCards} - ${value}\n
                **Dealer Hand**
                ${dealerCards} - ${dealerSum}\n
                Your Profit: ${bet} :coin:\n
                Your Wallet: ${userProfile.Wallet += Number(bet)} :coin:`)
            .setColor("Green")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getBlackJackLoseEmbed: async function getBlackJackLoseEmbed(user, bet, playerCards, value, dealerCards, dealerSum, userProfile) {
        return new EmbedBuilder()
            .setTitle("Blackjack - You Lost!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                **Your Hand**
                ${playerCards} - ${value}\n
                **Dealer Hand**
                ${dealerCards} - ${dealerSum}\n
                Lost: ${bet} :coin:\n
                Your Wallet: ${userProfile.Wallet - bet} :coin:`)
            .setColor("Red")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getBlackJackDrawEmbed: async function getBlackJackDrawEmbed(user, bet, playerCards, value, dealerCards, dealerSum, userProfile) {
        return new EmbedBuilder()
            .setTitle("Blackjack - Draw!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                **Your Hand**
                ${playerCards} - ${value}\n
                **Dealer Hand**
                ${dealerCards} - ${dealerSum}\n
                Draw! Keep your money.\n
                Lost: ${bet} :coin:\n
                Your Wallet: ${userProfile.Wallet} :coin:`)
            .setColor("Orange")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    }
};