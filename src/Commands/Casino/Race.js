const { SlashCommandBuilder } = require("discord.js");
const Profile = require("../../Models/Profile");
const { checkForUserProfile, getUserProfile, giveXPToUser } = require('../../Logic/Utils');
const { checkIfBetIsValid } = require('../../Logic/CasinoUtils');
const { promisify } = require('util');

const {
    getCustomColorAnswerEmbed,
    getDefaultWinEmbed,
    getDefaultLoseEmbed,
} = require("../../Logic/Embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("race")
        .setDescription("Bet on a racer!")
        .addStringOption((option) =>
            option
                .setName("race-type")
                .setDescription("Choose the race you want to bet on")
                .setRequired(true)
                .addChoices(
                    { name: "Knuckles x3", value: "knuckles" },
                    { name: "Shadow x5", value: "shadow" },
                    { name: "Dr. Eggman x7", value: "eggman" }
                )
        )
        .addStringOption((option) =>
            option
                .setName("prediction")
                .setDescription("Which racer you think will win")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("bet")
                .setDescription("The amount you want to bet")
                .setRequired(true)
        ),
    async execute(interaction) {
        const knucklesEmojiId = ":man_in_manual_wheelchair:";
        const shadowEmojiId = ":person_with_probing_cane:";
        const eggmanEmojiId = ":man_running:";
        const finishLineEmojiId = ":checkered_flag:";
        const winnerEmojiId = ":medal:";
        
        var bet = interaction.options.getString("bet");
        var prediction = interaction.options.getString("prediction");
        var raceType = interaction.options.getString("race-type");
        
        var userExists = await checkForUserProfile(interaction);
        if (!userExists) {
            return;
        }

        var isBetValid = await checkIfBetIsValid(interaction, bet);
        if (!isBetValid) return;

        var userProfile = await getUserProfile(interaction);

        if (bet === "a" && userProfile.Wallet > 0) {
            bet = userProfile.Wallet;
        }

        if (bet > userProfile.Wallet) {
            var notEnoughCoinsEmbed = await getCustomColorAnswerEmbed(
                "Race",
                `You dont have enough :coin:`,
                "Red",
                interaction.user
            );

            return await interaction.reply({
                embeds: [notEnoughCoinsEmbed],
            });
        }

        var racerType;
        var racerAmount;
        var winMultiplier;
        switch (raceType) {
            case "knuckles":
                racerAmount = 3;
                racerType = knucklesEmojiId;
                winMultiplier = 2;
                break;
            case "shadow":
                racerAmount = 5;
                racerType = shadowEmojiId;
                winMultiplier = 5;
                break;
            case "eggman":
                racerAmount = 7;
                racerType = eggmanEmojiId;
                winMultiplier = 10;
                break;
            default:
                break;
        }

        var win = bet * winMultiplier;
        var winningRacer = await startRace(bet, racerAmount, interaction, winnerEmojiId, finishLineEmojiId, racerType, userProfile, win);

        if (winningRacer === parseInt(prediction)) {
            var gainedXP = 10 * winMultiplier;

            await Profile.updateOne(
                { UserID: interaction.user.id },
                { $inc: { Wallet: -bet } }
            );

            await Profile.updateOne(
                { UserID: interaction.user.id },
                { $inc: { Wallet: win } }
            );

            await giveXPToUser(interaction.user, gainedXP);
        } else {
            await Profile.updateOne(
                { UserID: interaction.user.id },
                { $inc: { Wallet: -bet } }
            );

            await giveXPToUser(interaction.user, 5);
        }
    },
};

async function startRace(bet, racerAmount, interaction, winnerEmojiId, finishLineEmojiId, racerType, userProfile, win) {
    var raceTrackParts = [" ", "-", "- -", "- - -", "- - - -", "- - - - -"];  
    var racers = [];
    var raceIsWon = false;
    var moves = 4;

    var winningRacer = null;

    promisify(setTimeout);

    for (var p = 0; p < racerAmount; p++) {
      racers.push({ value: moves, finishEmojiId: finishLineEmojiId });
    }

    var raceEmbed = await getRaceEmbed(bet, racers, raceTrackParts, racerType, interaction, winningRacer, userProfile, win);
    await interaction.reply({
        embeds: [raceEmbed],
    });

    while (raceIsWon == false) {
      for (var p = 0; p < racerAmount; p++) {
        if (racers[p].value == 0) {
          raceIsWon = true;
          racers[p].finishEmojiId = winnerEmojiId;

          winningRacer = p + 1;
          break;
        }
        racers[p].value -= moveRacer();
      }

      raceEmbed = await getRaceEmbed(bet, racers, raceTrackParts, racerType, interaction, winningRacer, userProfile, win);
      await interaction.editReply({ embeds: [raceEmbed] });

      promisify(setTimeout);
    }

    return winningRacer;
  }

  async function getRaceEmbed(bet, racers, raceTrackParts, racerType, interaction, winningRacer, userProfile, win) {
    const title = "Race";
    const color = "Aqua";

    var description = "";
    for (let index = 0; index < racers.length; index++) {
        var formattedNumber = "0" + (index + 1);
        var racerRow = `\n\`${formattedNumber}\` - ${racers[index].finishEmojiId} ${raceTrackParts[racers[index].value]} ${racerType}`;

        description = description + racerRow;
    }

    var raceDefaultEmbed = await getCustomColorAnswerEmbed(
        title,
        description,
        color,
        interaction.user
    );

    if (winningRacer !== null) {

        description = description + `\n Racer \`${"0" + winningRacer}\` Won!`;
        if (parseInt(interaction.options.getString("prediction")) === winningRacer) {
            return await getDefaultWinEmbed(
                title,
                bet,
                description,
                win,
                userProfile.Wallet - bet,
                interaction.user
            );
        }

        return await getDefaultLoseEmbed(
            title,
            bet,
            description,
            bet,
            userProfile.Wallet,
            interaction.user
        );
    }

    return raceDefaultEmbed;
  }

  function moveRacer() {
    var move = Math.floor(Math.random() * 2);
    var minus;
    if (move == 1) {
      minus = 1;
    } else {
      minus = 0;
    }
    return minus;
  }