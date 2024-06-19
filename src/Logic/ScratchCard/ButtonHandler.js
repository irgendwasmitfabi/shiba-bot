const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    getThreePieceRow: async function getThreePieceRow(icon, rowIndex) {
        console.log("button" + rowIndex);
        var button1CustomId = "scratchcardButton" + '1' + "Row" + rowIndex;
        var button2CustomId = "scratchcardButton" + '2' + "Row" + rowIndex;
        var button3CustomId = "scratchcardButton" + '3' + "Row" + rowIndex;

        var rowButton = new ButtonBuilder()
            .setCustomId(button1CustomId)
            .setLabel(icon)
            .setStyle(ButtonStyle.Secondary)
        var rowButton2 = new ButtonBuilder()
            .setCustomId(button2CustomId)
            .setLabel(icon)
            .setStyle(ButtonStyle.Secondary)
        var rowButton3 = new ButtonBuilder()
            .setCustomId(button3CustomId)
            .setLabel(icon)
            .setStyle(ButtonStyle.Secondary)

        var buttons = [rowButton, rowButton2, rowButton3];

        return buttons;
    },
};