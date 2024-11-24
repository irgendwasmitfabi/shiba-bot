const Profile = require("../../Models/Profile");
const { checkForUserProfile, giveXPToUser, getUserProfile } = require('../../Logic/Utils');
const { getCustomColorAnswerEmbed } = require("../../Logic/Embed");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Get your daily award"),
  async execute(interaction) {
    const dailyReward = process.env.dailyReward;
    const user = interaction.user;

    const millisecondsInADay = 86400000;

    var dailyRewardEmbed = await getCustomColorAnswerEmbed(
      "Daily Reward",
      `You could not claim your daily reward`,
      "Orange",
      user
    );
    
    var userExists = await checkForUserProfile(interaction);
    if (!userExists) {
        return;
    }

    var userProfile = await getUserProfile(interaction);

    if (userProfile.LastDaily === "undefined" || Date.now() - userProfile.LastDaily > millisecondsInADay) {
      await Profile.updateOne(
        { UserID: user.id },
        { $set: { LastDaily: Date.now() } }
      );

      await Profile.updateOne(
        { UserID: user.id },
        { $inc: { Wallet: dailyReward } }
      );

      dailyRewardEmbed = await getCustomColorAnswerEmbed(
        "Daily Reward",
        `You have collected today's reward ${dailyReward}:coin:`,
        "Green",
        user
      );

      await giveXPToUser(user, 5);
    } else {
      var lastDaily = new Date(userProfile.LastDaily);

      const secondsInAnHour = 3600;
      const secondsInAMinute = 60;
      
      var timeLeftTillNextDaily = Math.max(0, Math.round((lastDaily.getTime() + millisecondsInADay - Date.now()) / 1000));
      var timeLeftInHours = Math.floor(timeLeftTillNextDaily / secondsInAnHour);
      var timeLeftInMinutes = Math.floor((timeLeftTillNextDaily % secondsInAnHour) / secondsInAMinute);
      var timeLeftInSeconds = timeLeftTillNextDaily % secondsInAMinute;

      dailyRewardEmbed = await getCustomColorAnswerEmbed(
        "Daily Reward",
        `You have to wait ${timeLeftInHours}h ${timeLeftInMinutes}m ${timeLeftInSeconds}s before you can collect your daily reward.`,
        "Orange",
        user
      );
    }

    await interaction.reply({
      embeds: [dailyRewardEmbed],
    });
  },
};
