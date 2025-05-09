const { getDefaultNegativeAnswerEmbed } = require('./Embed');
const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    checkIfBetIsValid: async function checkIfBetIsValid(interaction, bet, minimumBet, userProfile) {
        try {
            if (isNaN(bet) && bet !== "a") {
                var betIsNotValid = await getDefaultNegativeAnswerEmbed(
                    ":x: Your bet is not valid",
                    `Please enter a valid bet`,
                    interaction.user
                );

                await interaction.reply({
                    embeds: [betIsNotValid],
                });

                return false;
            }

            if (userProfile && bet > userProfile.Wallet) {
                var betIsNotValid = await getDefaultNegativeAnswerEmbed(
                    ":x: Your bet is not valid",
                    `You dont have enough :coin:`,
                    interaction.user
                );
    
                await interaction.reply({
                    embeds: [betIsNotValid],
                });
                
                return false;
            }

            if (minimumBet && minimumBet > bet) {
                var betIsNotValid = await getDefaultNegativeAnswerEmbed(
                    ":x: Your bet is not valid",
                    `The minimum bet for this game is ${minimumBet}!`,
                    interaction.user
                );

                await interaction.reply({
                    embeds: [betIsNotValid],
                });
                
                return false;
            }

            return true;
        } catch (error) {
            console.log(error);
        }
    },
    getThreePieceRow: async function getThreePieceRow(rowIndex, option) {
        var button01CustomId = "scratchcardButton" + '1' + "Row" + rowIndex;
        var button02CustomId = "scratchcardButton" + '2' + "Row" + rowIndex;
        var button03CustomId = "scratchcardButton" + '3' + "Row" + rowIndex;

        var emoji;
        switch (option) {
            case "darkchao":
                emoji = '<:darkchao:1338235258927059024>';
                break;
            case "herochao":
                emoji = '<:herochao:1338235266925723740>';
            default:
                break;
        }

        var rowButton01 = new ButtonBuilder()
            .setCustomId(button01CustomId)
            .setEmoji(emoji)
            .setStyle(ButtonStyle.Secondary)
        var rowButton02 = new ButtonBuilder()
            .setCustomId(button02CustomId)
            .setEmoji(emoji)
            .setStyle(ButtonStyle.Secondary)
        var rowButton03 = new ButtonBuilder()
            .setCustomId(button03CustomId)
            .setEmoji(emoji)
            .setStyle(ButtonStyle.Secondary)

        return [rowButton01, rowButton02, rowButton03];
    },
};