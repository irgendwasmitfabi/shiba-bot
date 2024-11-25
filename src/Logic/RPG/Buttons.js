var { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    getArrowLeftButton: async function getArrowLeftButton() {
        return new ButtonBuilder()
        .setCustomId('arrowleft')
        .setLabel('⬅️')
        .setStyle(ButtonStyle.Secondary)
    },
    getArrowRightButton: async function getArrowRightButton() {
        return new ButtonBuilder()
        .setCustomId('arrowright')
        .setLabel('➡️')
        .setStyle(ButtonStyle.Secondary)
    },
}