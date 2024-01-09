const { EmbedBuilder } = require('discord.js');

module.exports = {
    getDefaultNeutralAnswerEmbed: async function getDefaultNeutralAnswerEmbed(title, description) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor("DarkAqua")
    },
    getDefaultPositiveAnswerEmbed: async function getDefaultPositiveAnswerEmbed(title, description) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor("Green")
    },
    getDefaultNegativeAnswerEmbed: async function getDefaultNegativeAnswerEmbed(title, description) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor("Red")
    },
    getCustomColorAnswerEmbed: async function getCustomColorAnswerEmbed(title, description, color) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
    },
    getDefaultLoseEmbed: async function getDefaultLoseEmbed(gameTitle, bet, gameDescription, lost, walletValue) {
        return new EmbedBuilder()
            .setTitle(gameTitle + " - You Lost!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                ${gameDescription}\n
                Lost: ${lost}:coin:\n
                Your Wallet: ${walletValue - bet}:coin:`)
            .setColor("Red")
    },
    getDefaultWinEmbed: async function getDefaultWinEmbed(gameTitle, bet, gameDescription, profit, walletValue) {
        return new EmbedBuilder()
            .setTitle(gameTitle + " - You Won!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                ${gameDescription}\n
                Your Profit: ${profit}:coin:\n
                Your Wallet: ${walletValue + bet}:coin:`)
            .setColor("Green")
    },
    getMinecraftRecipeEmbed: async function getMinecraftRecipeEmbed(recipeName, imgURL) {
        return new EmbedBuilder()
            .setTitle(recipeName)
            .setImage(imgURL)
            .setColor("LuminousVividPink")
    }
};