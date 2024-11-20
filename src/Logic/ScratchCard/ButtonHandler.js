const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    getThreePieceRow: async function getThreePieceRow(rowIndex, option) {
        var button1CustomId = "scratchcardButton" + '1' + "Row" + rowIndex;
        var button2CustomId = "scratchcardButton" + '2' + "Row" + rowIndex;
        var button3CustomId = "scratchcardButton" + '3' + "Row" + rowIndex;
        
        var emoji;
        switch (option) {
            case "darkchao":
                emoji = '<:darkchao:1250176559109640224>';
                break;
            case "herochao":
                emoji = '<:herochao:1250175743925682266>';
            default:
                break;
        }

        var rowButton = new ButtonBuilder()
            .setCustomId(button1CustomId)
            .setEmoji(emoji)
            .setStyle(ButtonStyle.Secondary)
        var rowButton2 = new ButtonBuilder()
            .setCustomId(button2CustomId)
            .setEmoji(emoji)
            .setStyle(ButtonStyle.Secondary)
        var rowButton3 = new ButtonBuilder()
            .setCustomId(button3CustomId)
            .setEmoji(emoji)
            .setStyle(ButtonStyle.Secondary)

        var buttons = [rowButton, rowButton2, rowButton3];

        return buttons;
    },
};