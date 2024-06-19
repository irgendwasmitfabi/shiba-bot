const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");
const Profile = require("../../Models/Profile");
const { createProfile, giveXPToUser } = require('../../Logic/Utils');
const { getThreePieceRow } = require('../../Logic/ScratchCard/ButtonHandler');
const { ComponentType } = require('discord.js');
const {
    getDefaultNeutralAnswerEmbed,
    getDefaultWinEmbed,
    getDefaultNegativeAnswerEmbed,
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
                    { name: "Apes 300 Coins", value: "apes" },
                    { name: "Dinosaurs 500 Coins", value: "dinosaurs" }
                )
        ),
    async execute(interaction) {
        var scratchCardOption = interaction.options.getString("options");

        var bet;
        switch (scratchCardOption) {
            case "apes":
                bet = 300;
                break;
            case "dinosaurs":
                bet = 500;
                break;
            default:
                //Handle case?
                break;
        }

        // TODO: Move to handler!
        if (isNaN(bet) && bet !== "a") {
            var betNotValid = await getDefaultNegativeAnswerEmbed(
                ":x: Bet not valid",
                `Please enter a valid bet`
            );

            return await interaction.reply({
                embeds: [betNotValid],
            });
        }

        //TODO: Move to handler!
        const user = interaction.user;
        const userProfile = await Profile.find({
            UserID: user.id,
        });

        if (!userProfile.length) {
            await createProfile(interaction.user);

            var profileNotFoundEmbed = await getDefaultNeutralAnswerEmbed(
                "Profile not found",
                `Creating new profile...`
            );

            return await interaction.reply({
                embeds: [profileNotFoundEmbed],
            });
        }

        var scratchCardEmbed = await getScratchCardEmbed(
            "ScratchCard: " + scratchCardOption,
            "Gold"
        );

        // Set bet to all in
        if (bet === "a" && userProfile[0].Wallet > 0) {
            bet = userProfile[0].Wallet;
        }

        if (bet <= userProfile[0].Wallet) {
            await Profile.updateOne(
                { UserID: interaction.user.id },
                { $inc: { Wallet: -bet } }
            );
        } else {
            scratchCardEmbed = await getCustomColorAnswerEmbed(
                "ScratchCard",
                `You dont have enough money!`,
                "Red",
                interaction.user
            );

            return await interaction.reply({
                embeds: [scratchCardEmbed],
            });
        }

        var buttons = await getThreePieceRow("🦍", "1");
        var buttons1 = await getThreePieceRow("🦧", "2");
        var buttons2 = await getThreePieceRow("🐒", "3");

        var allButtonsArray = buttons.concat(buttons1, buttons2);

        testRow = new ActionRowBuilder()
            .addComponents(buttons);
        testRow1 = new ActionRowBuilder()
            .addComponents(buttons1);
        testRow2 = new ActionRowBuilder()
            .addComponents(buttons2);

        //Testing
        var message = await interaction.reply({
            embeds: [scratchCardEmbed],
            components: [testRow, testRow1, testRow2],
        });

        var values = [];
        allButtonsArray.forEach(button => {
            var selectedPoolNumber = getSelectedPoolNumber(values);

            values.push(selectedPoolNumber);
        });
        console.log(values);

        var allButtonsArrayLength = allButtonsArray.length;
        var clickedButtonsCount = 0;

        var collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 100_000 });
        collector.on('collect', buttonInteraction => {
            if (buttonInteraction.user.id === interaction.user.id) {
                var buttonCustomId = buttonInteraction.customId;
                var buttonIndex = getButtonIndex(buttonCustomId);

                var clickedButton = allButtonsArray[buttonIndex];

                clickedButton
                    .setLabel(`${values[buttonIndex]}`)
                    .setDisabled(true);
                
                interaction.editReply({
                    embeds: [scratchCardEmbed],
                    components: [testRow, testRow1, testRow2],
                });

                clickedButtonsCount++;
                if (clickedButtonsCount === allButtonsArrayLength) {
                    checkForWin(values, 3, interaction);
                    buttonInteraction.reply({ content: `Game Finished` });
                } else {
                    buttonInteraction.deferUpdate();
                }
            } else {
                buttonInteraction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }
        });
        
        collector.on('end', collected => {
            // Interaction is no longer available
            console.log(`Collected ${collected.size} interactions.`);
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

function getRandomValue() {
    var jsonData = [
        {
          "value": 1000,
          "probability": 0.025
        },
        {
          "value": 500,
          "probability": 0.05
        },
        {
          "value": 400,
          "probability": 0.075
        },
        {
          "value": 300,
          "probability": 0.1
        },
        {
          "value": 200,
          "probability": 0.15
        },
        {
          "value": 100,
          "probability": 0.2
        },
        {
          "value": 50,
          "probability": 0.4
        }
    ];

    var rand = Math.random();
    var cumulativeProbability = 0;
    for (var i = 0; i < jsonData.length; i++) {
        cumulativeProbability += jsonData[i].probability;
        if (rand < cumulativeProbability) {
            return jsonData[i].value;
        }
    }

    return jsonData[jsonData.length - 1].value;
}

function getSelectedPoolNumber(values) {
    var selectedPoolNumber = getRandomValue();
    var result = checkForThreeSameNumbers(values, 3);

    var alreadyThreeSameNumbers = result != null && Array.isArray(result) && result.includes(selectedPoolNumber);
    console.log(alreadyThreeSameNumbers);

    while (alreadyThreeSameNumbers) {
        selectedPoolNumber = getRandomValue();

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
            console.log(winnings);
        });

        var scratchCardEmbed = await getScratchCardEmbed(
            `You won ${winnings}:coin:!`,
            "Green"
        );

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
            "Red"
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