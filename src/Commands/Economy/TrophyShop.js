const { getDefaultNeutralAnswerEmbed, getDefaultNegativeAnswerEmbed, getCustomColorAnswerEmbed } = require('../../Logic/Embed');
const { checkForUserProfile } = require('../../Logic/Utils');
const { getTrophyById } = require('../../Logic/TrophyUtils');
const { SlashCommandBuilder } = require('discord.js');
const Trophy = require('../../Models/Trophy');
const Profile = require('../../Models/Profile');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trophyshop')
		.setDescription('Shop for trophies')
        .addStringOption((option) =>
            option
                .setName("trophy")
                .setDescription("Choose the trophy you want to buy")
                .addChoices(
					{ name: "Sunflower", value: "1" },
					{ name: "Pineapple", value: "2" },
					{ name: "Crossed Swords", value: "3" },
					{ name: "European Castle", value: "4" },
					{ name: "New Moon", value: "5" },
					{ name: "Phoenix", value: "6" }
				)
        )
        .addStringOption((option) =>
            option
                .setName("amount")
                .setDescription("The amount you want to buy")
        ),
	async execute(interaction) {
        var userProfile = await checkForUserProfile(interaction);
        
        var formatter = new Intl.NumberFormat('us-US');

        var trophies = await getTrophies();
        var trophyString = trophies.map(trophy => 
            `${trophy.EmojiId} **${trophy.Name}** ${formatter.format(trophy.Value)}:coin:\n\n`
        ).join('');

        if (parseInt(interaction.options.getString("trophy"))) {
            var result = await buyTrophy(interaction, userProfile);

            if (result) {
                return await interaction.reply({
                    embeds: [result]
                });
            }
        }

        var defaultNeutralAnswerEmbed = await getDefaultNeutralAnswerEmbed(
            "Trophy Shop",
            `${trophyString}`
        );
        await interaction.reply({
            embeds: [defaultNeutralAnswerEmbed]
        });
	},
};

async function getTrophies() {
    try {
        return await Trophy.find().sort({ Id: 1 });
  } catch (error) {
      console.log(error);
  }
}

async function buyTrophy(interaction, userProfile) {
    var amount = parseInt(interaction.options.getString("amount")) || 1; 

    var boughtTrophyId = parseInt(interaction.options.getString("trophy"));
    var boughtTrophy = await getTrophyById(boughtTrophyId);

    if (!boughtTrophy) return null;

    var price = amount * boughtTrophy.Value;
    
    if (userProfile.Wallet < price) {
        return await getDefaultNegativeAnswerEmbed(
            "Trophy Shop",
            `You don't have enough :coin: in your wallet!`,
            interaction.user
        );
    }

    await Profile.updateOne(
        { UserID: interaction.user.id },
        { $inc: { Wallet: -price } }
    );

    const existingTrophy = userProfile.Trophies.find(p => p.TrophyId === boughtTrophy.Id);
    if (existingTrophy) {
        existingTrophy.Amount += amount;
    } else {
        userProfile.Trophies.push({
          TrophyId: boughtTrophy.Id,
          Name: boughtTrophy.Name,
          EmojiId: boughtTrophy.EmojiId,
          Amount: 1,
        });
    }
    await userProfile.save();

    var trophies = userProfile.Trophies.sort((a, b) => a.TrophyId - b.TrophyId);
    var trophyString = trophies.map(trophy => 
        `${trophy.EmojiId} **${trophy.Name}** ${trophy.Amount}x\n\n`
    ).join('');

    return await getCustomColorAnswerEmbed(
        "Trophy Shop",
        `You bought ${amount}x ${boughtTrophy.EmojiId} ${boughtTrophy.Name}!\n 
        **Wallet:** ${userProfile.Wallet - price} :coin:\n\n **Trophies:**\n\n ${trophyString}`,
        "Aqua",
        interaction.user
    );
}
