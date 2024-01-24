const Profile = require("../../Models/Profile");
const { createProfile, giveXPToUser } = require('../../Logic/Utils');
const { getCustomColorAnswerEmbed, getDefaultNeutralAnswerEmbed } = require("../../Logic/Embed");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Get your daily award"),
  async execute(interaction) {
    const dailyReward = process.env.dailyReward;
    const userId = interaction.user.id;

    var dailyRewardEmbed = await getCustomColorAnswerEmbed(
      "Daily Reward",
      `You could not claim youre daily reward`,
      "Orange",
      interaction.user
    );
    
    const userProfile = await Profile.find({ UserID: userId });
    if (!userProfile.length) {
      await createProfile(interaction.user);

      var profileNotFoundEmbed = await getDefaultNeutralAnswerEmbed(
        "Profile not found",
        `Creating new profile...`
      );

      return await interaction.reply({
        embeds: [profileNotFoundEmbed],
      });
    } else if (userProfile[0].lastDaily === "undefined") {
      await Profile.updateOne(
        { UserID: userId },
        { $set: { lastDaily: Date.now() } }
      );

      await Profile.updateOne(
        { UserID: userId },
        { $inc: { Wallet: dailyReward } }
      );

      dailyRewardEmbed = await getCustomColorAnswerEmbed(
        "Daily Reward",
        `You have collected today's reward ${dailyReward}:coin:.\nCome back tomorrow to collect more.`,
        "Green",
        interaction.user
      );

      await giveXPToUser(interaction.user, 5);
    } else if (Date.now() - userProfile[0].lastDaily > 86400000) {
      await Profile.updateOne(
        { UserID: userId },
        { $set: { lastDaily: Date.now() } }
      );

      await Profile.updateOne(
        { UserID: userId },
        { $inc: { Wallet: 25 } }
      );

      dailyRewardEmbed = await getCustomColorAnswerEmbed(
        "Daily Reward",
        `You have collected today's reward ${dailyReward}:coin:`,
        "Green",
        interaction.user
      );

      await giveXPToUser(interaction.user, 5);
    } else {
      const lastDaily = new Date(userProfile[0].lastDaily);

      const timeLeftTillNextDaily = Math.round(
        (lastDaily.getTime() + 86400000 - Date.now()) / 1000
      );
      const timeLeftInHours = Math.floor(timeLeftTillNextDaily / 3600);
      const timeLeftInMinutes = Math.floor(
        (timeLeftTillNextDaily - timeLeftInHours * 3600) / 60
      );
      const timeLeftInSeconds =
        timeLeftTillNextDaily - timeLeftInHours * 3600 - timeLeftInMinutes * 60;

      dailyRewardEmbed = await getCustomColorAnswerEmbed(
        "Daily Reward",
        `You have to wait ${timeLeftInHours}h ${timeLeftInMinutes}m ${timeLeftInSeconds}s before you can collect your daily reward.`,
        "Orange",
        interaction.user
      );
    }

    await interaction.reply({
      embeds: [dailyRewardEmbed],
    });
  },
};
