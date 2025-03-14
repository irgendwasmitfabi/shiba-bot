const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");
const Profile = require("../../Models/Profile");
const { checkForUserProfile, giveXPToUser } = require('../../Logic/Utils');
const { checkIfBetIsValid, getThreePieceRow } = require('../../Logic/CasinoUtils');
const { ComponentType } = require('discord.js');
const DarkChaoWinPool = require('../../Data/Scratchcard/DarkChaoWinPool.json');
const HeroChaoWinPool = require('../../Data/Scratchcard/HeroChaoWinPool.json');

const {
    getCustomColorAnswerEmbed,
    getScratchCardEmbed
} = require("../../Logic/Embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("scratchcard")
        .setDescription("Scratch a scratch card!")
        .addStringOption((option) =>
            option
                .setName("options")
                .setDescription("Choose the scratchcard")
                .setRequired(true)
                .addChoices(
                    { name: "Dark Chao 300 Coins", value: "darkchao" },
                    { name: "Hero Chao 500 Coins", value: "herochao" }
                )
        ),
    async execute(interaction) {
        var userProfile = await checkForUserProfile(interaction);

        var scratchCardOption = interaction.options.getString("options");

        var winPool;
        var bet;
        switch (scratchCardOption) {
            case "darkchao":
                bet = 300;
                winPool = DarkChaoWinPool.winnings;
                break;
            case "herochao":
                bet = 500;
                winPool = HeroChaoWinPool.winnings;
                break;
            default:
                break;
        }

        var isBetValid = await checkIfBetIsValid(interaction, bet);
        if (!isBetValid) return;

        var scratchCardEmbed = await getScratchCardEmbed(
            "ScratchCard: " + scratchCardOption,
            "Gold",
            interaction.user
        );

        if (bet === "a" && userProfile.Wallet > 0) {
            bet = userProfile.Wallet;
        }

        if (bet > userProfile.Wallet) {
            scratchCardEmbed = await getCustomColorAnswerEmbed(
                "ScratchCard",
                `You dont have enough :coin:!`,
                "Red",
                interaction.user
            );

            return await interaction.reply({
                embeds: [scratchCardEmbed],
            });
        }

        await Profile.updateOne(
            { UserID: interaction.user.id },
            { $inc: { Wallet: -bet } }
        );

        var buttonRow01 = await getThreePieceRow( "1", scratchCardOption);
        var buttonRow02 = await getThreePieceRow("2", scratchCardOption);
        var buttonRow03 = await getThreePieceRow("3", scratchCardOption);

        var combinedButtonRows = [...buttonRow01, ...buttonRow02, ...buttonRow03];

        var rowComponent01 = new ActionRowBuilder()
            .addComponents(buttonRow01);
        var rowComponent02 = new ActionRowBuilder()
            .addComponents(buttonRow02);
        var rowComponent03 = new ActionRowBuilder()
            .addComponents(buttonRow03);

        var message = await interaction.reply({
            embeds: [scratchCardEmbed],
            components: [rowComponent01, rowComponent02, rowComponent03],
        });

        var selectedPoolNumbers = [];
        combinedButtonRows.forEach(() => {
            var selectedPoolNumber = getSelectedPoolNumber(selectedPoolNumbers, winPool);

            selectedPoolNumbers.push(selectedPoolNumber);
        });

        var clickedButtonsCount = 0;

        var collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 100_000 });
        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }

            var buttonCustomId = buttonInteraction.customId;
            var buttonIndex = getButtonIndex(buttonCustomId);

            var clickedButton = combinedButtonRows[buttonIndex];

            clickedButton
                .setLabel(`${selectedPoolNumbers[buttonIndex]}`)
                .setDisabled(true);
            
            interaction.editReply({
                embeds: [scratchCardEmbed],
                components: [rowComponent01, rowComponent02, rowComponent03],
            });

            clickedButtonsCount++;
            if (clickedButtonsCount === combinedButtonRows.length) {
                checkForWin(selectedPoolNumbers, 3, interaction);
                await buttonInteraction.deferUpdate();
            } else {
                buttonInteraction.deferUpdate();
            }
        });
        
        collector.on('end', collected => {
            if (collected.length >= 9) {
                interaction.deleteReply();
            }
        });
    },
};

function getButtonPosition(customId) {
    var match = customId.match(/\d/);
    return match ? parseInt(match[0]) : null;
}

function getButtonRow(customId) {
    var match = customId.match(/\d(?!.*\d)/);
    return match ? parseInt(match[0]) : null;
}

function getButtonIndex(buttonCustomId) {
    var buttonPositionIndex = getButtonPosition(buttonCustomId);
    var buttonRowIndex = getButtonRow(buttonCustomId);

    var buttonIndex;
    switch (buttonRowIndex) {
        case 1:
            buttonIndex = buttonPositionIndex;
            break;
        case 2:
            buttonIndex = buttonPositionIndex + 3;
            break;
        case 3:
            buttonIndex = buttonPositionIndex + 6;
            break;
        default:
            break;
    }

    return buttonIndex - 1;
}

function getRandomValue(winPool) {
    var cumulativeProbability = 0;
    for (var i = 0; i < winPool.length; i++) {
        cumulativeProbability += winPool[i].probability;
        if (Math.random() < cumulativeProbability) {
            return winPool[i].value;
        }
    }

    return winPool[winPool.length - 1].value;
}

function getSelectedPoolNumber(values, winPool) {
    var selectedPoolNumber = getRandomValue(winPool);
    var result = checkForThreeSameNumbers(values, 3);

    var alreadyThreeSameNumbers = result != null && Array.isArray(result) && result.includes(selectedPoolNumber);

    while (alreadyThreeSameNumbers) {
        selectedPoolNumber = getRandomValue(winPool);

        result = checkForThreeSameNumbers(values, 3);

        alreadyThreeSameNumbers = result != null && Array.isArray(result) && result.includes(selectedPoolNumber)
    }

    return selectedPoolNumber;
}

async function checkForWin(values, amountToWin, interaction) {
    var results = checkForThreeSameNumbers(values, amountToWin);
  
    if (results !== null && results.length >= 0) {
        var winnings = 0;

        results.forEach(result => {
            winnings += result;
        });

        scratchCardEmbed = await getScratchCardEmbed(
            `You won ${winnings}:coin:!`,
            "Green",
            interaction.user
        );

        if (results !== 0) {
            scratchCardEmbed = await getScratchCardEmbed(
                `You won ${winnings}:coin:!`,
                "Green",
                interaction.user
            );
        } else {
            scratchCardEmbed = await getScratchCardEmbed(
                `You lost!`,
                "Red",
                interaction.user
            );
        }

        await interaction.editReply({
            embeds: [scratchCardEmbed]
        });

        await Profile.updateOne(
            { UserID: interaction.user.id },
            { $inc: { Wallet: winnings } }
        );
    } else {
        var scratchCardEmbed = await getScratchCardEmbed(
            `You didn't win anything!`,
            "Red",
            interaction.user
        );

        await interaction.editReply({
            embeds: [scratchCardEmbed]
        });
    }
}

function checkForThreeSameNumbers(values, amountToWin){
    var countMap = {};
    var result = [];
  
    values.forEach(num => {
      if (countMap[num]) {
        countMap[num]++;
      } else {
        countMap[num] = 1;
      }
  
      if (countMap[num] >= amountToWin) {
        result.push(num);
      }
    });

    return result;
}