var { EmbedBuilder } = require('discord.js');

module.exports = {
    getDefaultEventEmbed: async function getDefaultEventEmbed(character, dungeonName, eventName) {
        return new EmbedBuilder()
            .setTitle(gameTitle + " - You Won!")
            .setDescription(
                `Your bet: ${bet}:coin:\n
                ${gameDescription}\n
                Your Profit: ${profit}:coin:\n
                Your Wallet: ${walletValue += Number(profit)}:coin:`)
            .setColor("Green")
            .setFooter({ text: `${character.name} - ${character.class}`});
    },
    getCreateStatsEmbed: async function getCreateStatsEmbed(character) {
        return new EmbedBuilder()
            .setTitle("Choose Your Character Stats")
            .setDescription(
                `Charisma: 0\n
                Dexterity: 0\n
                Stealth: 0\n
                Strength: 0`)
            .setColor("Green")
            .setFooter({ text: `${character.name} - ${character.class}`});
    },
    getCreateCharacterEmbed: async function getCreateCharacterEmbed() {
        return new EmbedBuilder()
            .setTitle("Create your Character!")
            .setDescription(
                `Lets Begin!\n
                Choose a class for your character!`)
            .setColor("Green");
    },
    getCreateCharacterErrorEmbed: async function getCreateCharacterErrorEmbed() {
        return new EmbedBuilder()
            .setTitle("Error")
            .setDescription(
                `Please enter a valid name for your character`)
            .setColor("Red");
    },
    getClassesEmbed: async function getClassesEmbed(classType) {
        return new EmbedBuilder()
            .setTitle(`${classType.Name}`)
            .setDescription(
                `Stats:\n
                Charisma: ${classType.Charisma}\n
                Strength: ${classType.Strength}\n
                Dexterity: ${classType.Dexterity}\n
                Stealth: ${classType.Stealth}\n
                `)
            .setColor("Purple");
    },
};