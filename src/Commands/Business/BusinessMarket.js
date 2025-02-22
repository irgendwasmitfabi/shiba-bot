const { getDefaultNeutralAnswerEmbed, getDefaultNegativeAnswerEmbed, getCustomColorAnswerEmbed } = require('../../Logic/Embed');
const { checkForUserProfile, getUserProfile } = require('../../Logic/Utils');
const { SlashCommandBuilder } = require('discord.js');
const Business = require('../../Models/Business');
const Profile = require('../../Models/Profile');
const { getBusinessById } = require('../../Logic/BusinessUtils');

const formatter = new Intl.NumberFormat('us-US');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('businessmarket')
		.setDescription('Shop for new business')
        .addStringOption((option) =>
            option
                .setName("business")
                .setDescription("Choose the business you want to buy")
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
        var userExists = await checkForUserProfile(interaction);
        if (!userExists) {
            return;
        }
    
        var businesses = await getBusinesses();
        var businessString = businesses.map(business => 
            `${business.EmojiId} **${business.Name}** ${formatter.format(business.Price)}:coin:\n\n`
        ).join('');

        if (parseInt(interaction.options.getString("business"))) {
            var result = await buyBusiness(interaction);

            if (result) {
                return await interaction.reply({
                    embeds: [result]
                });
            }
        }

        var defaultNeutralAnswerEmbed = await getDefaultNeutralAnswerEmbed(
            "Business Market",
            `${businessString}`
        );
        await interaction.reply({
            embeds: [defaultNeutralAnswerEmbed]
        });
	},
};

async function getBusinesses() {
    try {
        return await Business.find().sort({ Id: 1 });
  } catch (error) {
      console.log(error);
  }
}

async function buyBusiness(interaction) {
    var boughtBusinessId = parseInt(interaction.options.getString("business"));
    var boughtBusiness = await getBusinessById(boughtBusinessId);

    if (!boughtBusiness) return null;

    var price = boughtBusiness.Price;
    var userProfile = await getUserProfile(interaction);
    if (userProfile.Wallet < price) {
        return await getDefaultNegativeAnswerEmbed(
            "Business Market",
            `You don't have enough :coin: in your wallet!`,
            interaction.user
        );
    }

    const existingBusiness = userProfile.Businesses.find(p => p.BusinessId === boughtBusiness.Id);
    if (existingBusiness) {
        return await getDefaultNegativeAnswerEmbed(
            "Business Market",
            `You already have this business!`,
            interaction.user
        );
    } else {
        userProfile.Businesses.push({
            BusinessId: boughtBusiness.Id,
            Name: boughtBusiness.Name,
            EmojiId: boughtBusiness.EmojiId,
            CurrentProfit: boughtBusiness.Levels[0].Profit,
            Level: 1,
            IsMax: false,
        });
    }

    await Profile.updateOne(
        { UserID: interaction.user.id },
        { $inc: { Wallet: -price } }
    );

    await userProfile.save();

    var businesses = userProfile.Businesses.sort((a, b) => a.BusinessId - b.BusinessId);
    var businessString = businesses.map(business => 
        `${business.EmojiId} **${business.Name}** **Level ${business.Level}**\n\n`
    ).join('');

    var currentWallet = userProfile.Wallet - price;
    return await getCustomColorAnswerEmbed(
        "Business Market",
        `You bought a ${boughtBusiness.EmojiId} ${boughtBusiness.Name}!\n 
        **Wallet:** ${formatter.format(currentWallet)} :coin:\n\n **Businesses:**\n\n ${businessString}`,
        "Aqua",
        interaction.user
    );
}
