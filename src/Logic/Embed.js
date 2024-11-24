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
    getDefaultNegativeAnswerEmbed: async function getDefaultNegativeAnswerEmbed(title, description, user) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor("Red")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getCustomColorAnswerEmbed: async function getCustomColorAnswerEmbed(title, description, color, user) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getDefaultLoseEmbed: async function getDefaultLoseEmbed(gameTitle, bet, gameDescription, lost, walletValue, user) {
        return new EmbedBuilder()
            .setTitle(gameTitle + " - You Lost!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                ${gameDescription}\n
                Lost: ${lost}:coin:\n
                Your Wallet: ${walletValue -= Number(lost)}:coin:`)
            .setColor("Red")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getDefaultWinEmbed: async function getDefaultWinEmbed(gameTitle, bet, gameDescription, profit, walletValue, user) {
        return new EmbedBuilder()
            .setTitle(gameTitle + " - You Won!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                ${gameDescription}\n
                Your Profit: ${profit}:coin:\n
                Your Wallet: ${walletValue += Number(profit)}:coin:`)
            .setColor("Green")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getDefaultDrawEmbed: async function getDefaultDrawEmbed(gameTitle, bet, gameDescription, walletValue, user) {
        return new EmbedBuilder()
            .setTitle(gameTitle + " - Draw!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                ${gameDescription}\n
                Your Wallet: ${walletValue}:coin:`)
            .setColor("Yellow")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getSlotsIdleEmbed: async function getSlotsIdleEmbed(bet, user) {
        return new EmbedBuilder()
            .setTitle("Slots")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                <a:slots1:1199827995729350777> <a:slots1:1199827995729350777> <a:slots1:1199827995729350777>\n`)
            .setColor("Gold")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getMinecraftRecipeEmbed: async function getMinecraftRecipeEmbed(recipeName, imgURL) {
        return new EmbedBuilder()
            .setTitle(recipeName)
            .setImage(imgURL)
            .setColor("LuminousVividPink")
    },
    getUserInformationEmbed: async function getUserInformationEmbed(user, profile) {
        return new EmbedBuilder()
            .setTitle(`${user.username}`)
            .setThumbnail(`${user.displayAvatarURL()}`)
            .setDescription(
                `**Level**: ${profile.Level}\n **Current XP**: ${profile.CurrentXP} XP\n
                **Wallet**: ${profile.Wallet} :coin:\n **Bank** ${profile.Bank} :coin:`)
            .setColor("LuminousVividPink")
    },
    getUserLevelUpEmbed: async function getUserLevelUpEmbed(user, profile) {
        return new EmbedBuilder()
            .setTitle(`Level Up!`)
            .setDescription(
                `${user.username} is now Level ${profile.Level}!\n
                **Current XP**: ${profile.CurrentXP}XP of ${profile.XPForNextLevel}XP\n
                You got ${profile.Level * 100}:coin:`)
            .setColor("LuminousVividPink")
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
    getScratchCardEmbed: async function getScratchCardEmbed(title, color, user) {
        return new EmbedBuilder()
            .setTitle(`${title}`)
            .setColor(color)
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
};