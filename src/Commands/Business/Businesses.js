const Profile = require("../../Models/Profile");
const { checkForUserProfile, giveXPToUser } = require('../../Logic/Utils');
const { getCustomColorAnswerEmbed, getDefaultNegativeAnswerEmbed } = require("../../Logic/Embed");
const { SlashCommandBuilder } = require("discord.js");
const { getBusinessById } = require('../../Logic/BusinessUtils');

const formatter = new Intl.NumberFormat('us-US');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("businesses")
    .setDescription("Manage your businesses")
    .addStringOption((option) =>
        option
            .setName("action")
            .setDescription("What do you want to do?")
            .setRequired(true)
            .addChoices(
                { name: "Show Info", value: "info" },
                { name: "Collect Profit", value: "collect" },
                { name: "Upgrade Business", value: "upgrade" },
            )
    )
    .addStringOption((option) =>
        option
            .setName("business")
            .setDescription("Which Business?")
            .setRequired(true)
            .addChoices(
                { name: "Kiosk", value: "1" },
                { name: "Pawn Shop", value: "2" },
                { name: "Gym", value: "3" },
                { name: "Car Wash", value: "4" },
                { name: "Nightclub", value: "5" },
                { name: "Casino", value: "6" }
            )
    ),
  async execute(interaction) {
    var userProfile = await checkForUserProfile(interaction);

    var businessId = parseInt(interaction.options.getString("business"));

    var userBusiness = userProfile.Businesses.find(p => p.BusinessId === businessId);

    if (!userBusiness) {
      var userDoesNotOwnBusinessEmbed = await getDefaultNegativeAnswerEmbed(
        "Businesses",
        `You dont own this business!`,
        interaction.user
      );

      return await interaction.reply({
        embeds: [userDoesNotOwnBusinessEmbed],
      });
    }

    var business = await getBusinessById(businessId);

    var action = interaction.options.getString("action");
    switch (action) {
        case "info":
            await getBusinessInfo(interaction, userBusiness, business);
            break;
        case "collect":
            await collectDailyProfit(interaction, userBusiness, userProfile);
            break;
        case "upgrade":
            await upgradeBusiness(interaction, userBusiness, business, userProfile);
            break;
        default:
            break;
    }
  },
};

async function collectDailyProfit(interaction, userBusiness, userProfile) {
  var millisecondsInADay = 86400000;
  var lastCollected = userBusiness.LastCollected || 0;
  var timeSinceLastCollected = Date.now() - lastCollected;

  if (timeSinceLastCollected > millisecondsInADay) {
      userBusiness.LastCollected = Date.now();
      await userProfile.save();

      await Profile.updateOne(
          { UserID: interaction.user.id },
          { $inc: { Wallet: userBusiness.CurrentProfit } }
      );

      var profitEmbed = await getCustomColorAnswerEmbed(
          userBusiness.Name,
          `You have collected today's profits: ${formatter.format(userBusiness.CurrentProfit)} :coin:`,
          "Green",
          interaction.user
      );

      await giveXPToUser(interaction.user, 5);
  } else {
      var timeLeftTillNextDaily = Math.max(0, Math.round((lastCollected + millisecondsInADay - Date.now()) / 1000));
      var timeLeftInHours = Math.floor(timeLeftTillNextDaily / 3600);
      var timeLeftInMinutes = Math.floor((timeLeftTillNextDaily % 3600) / 60);
      var timeLeftInSeconds = timeLeftTillNextDaily % 60;

      var profitEmbed = await getCustomColorAnswerEmbed(
          userBusiness.Name,
          `You have to wait ${timeLeftInHours}h ${timeLeftInMinutes}m ${timeLeftInSeconds}s before you can collect your profit.`,
          "Orange",
          interaction.user
      );
  }

  await interaction.reply({ embeds: [profitEmbed] });
}

async function getBusinessInfo(interaction, userBusiness, business) {
  var nextBusinessLevel = business.Levels.find(p => p.Level === userBusiness.Level + 1);
  
  var embedColor = userBusiness.IsMax ? "LuminousVividPink" : "Aqua";
  var maxLevel = userBusiness.IsMax ? "MAX" : "";
  var nextUpgrade = userBusiness.IsMax ? "" : `**Next Upgrade:** ${formatter.format(nextBusinessLevel.UpgradePrice)} :coin:`;

  var embed = await getCustomColorAnswerEmbed(
      `**${userBusiness.Name}** ${userBusiness.EmojiId} ${maxLevel}`,
      `**Level ${userBusiness.Level}**\n
      **Current Profit:** ${formatter.format(userBusiness.CurrentProfit)} :coin:
      ${nextUpgrade}`,
      embedColor,
      interaction.user
  );

  await interaction.reply({ embeds: [embed] });
}

async function upgradeBusiness(interaction, userBusiness, business, userProfile) {
  if (userBusiness.IsMax) {
      var alreadyMaxLevelEmbed = await getDefaultNegativeAnswerEmbed(
          "Businesses",
          "You can't upgrade. Your business is already at Max level!",
          interaction.user
      );
      return await interaction.reply({ embeds: [alreadyMaxLevelEmbed] });
  }

  var upgradedLevelNumber = userBusiness.Level + 1;
  var upgradedLevel = business.Levels.find(p => p.Level === upgradedLevelNumber);

  if (!upgradedLevel || userProfile.Wallet < upgradedLevel.UpgradePrice) {
      var notEnoughCoinsEmbed = await getDefaultNegativeAnswerEmbed(
          "Businesses",
          "You can't upgrade. You don't have enough :coin:!",
          interaction.user
      );
      return await interaction.reply({ embeds: [notEnoughCoinsEmbed] });
  }

  userProfile.Wallet -= upgradedLevel.UpgradePrice;
  userBusiness.Level = upgradedLevelNumber;
  userBusiness.CurrentProfit = upgradedLevel.Profit;
  userBusiness.IsMax = upgradedLevelNumber === 10;

  await userProfile.save();

  var maxLevel = userBusiness.IsMax ? "MAX" : "";
  var embedColor = userBusiness.IsMax ? "LuminousVividPink" : "Aqua";
  var nextLevel = business.Levels.find(p => p.Level === upgradedLevelNumber + 1);
  var nextUpgradeString = userBusiness.IsMax ? "" : `**Next Upgrade:** ${formatter.format(nextLevel.UpgradePrice)} :coin:`;

  var embed = await getCustomColorAnswerEmbed(
      `**${userBusiness.Name}** ${userBusiness.EmojiId} ${maxLevel}`,
      `**Level ${userBusiness.Level}**\n
      **You upgraded your business!**\n
      **Current Profit:** ${formatter.format(userBusiness.CurrentProfit)} :coin:
      ${nextUpgradeString}`,
      embedColor,
      interaction.user
  );

  await interaction.reply({ embeds: [embed] });
}

