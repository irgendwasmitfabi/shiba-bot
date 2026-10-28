const Profile = require("../../Models/Profile");
const { checkForUserProfile, giveXPToUser } = require('../../Logic/Utils');
const { getCustomColorAnswerEmbed } = require("../../Logic/Embed");
const { SlashCommandBuilder } = require("discord.js");

const formatter = new Intl.NumberFormat('us-US');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Mow some lawn and get quick cash"),
  async execute(interaction) {
    const workReward = process.env.dailyReward / 10;
    const user = interaction.user;

    const tenMinutesInMilliseconds = 600000;

    var workRewardEmbed = await getCustomColorAnswerEmbed(
      "Work Reward",
      `You could not claim your work reward`,
      "Orange",
      user
    );
    
    var userProfile = await checkForUserProfile(interaction);

    var calculatedWorkReward = workReward * userProfile.Level;

    if (!userProfile.LastWork || Date.now() - userProfile.LastWork > tenMinutesInMilliseconds) {
      await Profile.updateOne(
        { UserID: user.id },
        { $set: { LastWork: Date.now() } }
      );

      await Profile.updateOne(
        { UserID: user.id },
        { $inc: { Wallet: calculatedWorkReward } }
      );

      workRewardEmbed = await getCustomColorAnswerEmbed(
        "Work Reward",
        `You have collected ${formatter.format(calculatedWorkReward)}:coin: for working`,
        "Green",
        user
      );

      await giveXPToUser(user, 5);
    } else {
      var LastWork = new Date(userProfile.LastWork);

      const secondsInAnHour = 3600;
      const secondsInAMinute = 60;
      
      var timeLeftTillNextWork = Math.max(0, Math.round((LastWork.getTime() + tenMinutesInMilliseconds - Date.now()) / 1000));
      var timeLeftInHours = Math.floor(timeLeftTillNextWork / secondsInAnHour);
      var timeLeftInMinutes = Math.floor((timeLeftTillNextWork % secondsInAnHour) / secondsInAMinute);
      var timeLeftInSeconds = timeLeftTillNextWork % secondsInAMinute;

      workRewardEmbed = await getCustomColorAnswerEmbed(
        "Work Reward",
        `You have to wait ${timeLeftInHours}h ${timeLeftInMinutes}m ${timeLeftInSeconds}s before you can work again.`,
        "Orange",
        user
      );
    }

    await interaction.reply({
      embeds: [workRewardEmbed],
    });
  },
};
