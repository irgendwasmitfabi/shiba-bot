const { getDefaultNeutralAnswerEmbed, getDefaultNegativeAnswerEmbed } = require('../../Logic/Embed');
const { checkForUserProfile, getUserProfile } = require('../../Logic/Utils');
const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../Models/Profile');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bank')
		.setDescription('Manage your bank account')
        .addStringOption((option) =>
            option
                .setName("action")
                .setDescription("Choose the action you want to perform")
                .setRequired(true)
                .addChoices(
                    { name: "Deposit", value: "deposit" },
                    { name: "Withdraw", value: "withdraw" }
                )
        )
        .addStringOption((option) =>
            option
                .setName("amount")
                .setDescription("The amount you want to deposit / withdraw")
                .setRequired(true)
        ),
	async execute(interaction) {
        var userExists = await checkForUserProfile(interaction);
        if (!userExists) {
            return;
        }

        var interactionReply;

        var amount = parseInt(interaction.options.getString("amount"));
        var bankAction = interaction.options.getString("action");
        switch (bankAction) {
            case "deposit":
                interactionReply = await depositCoins(interaction, amount);
                break;
            case "withdraw":
                interactionReply = await withdrawCoins(interaction, amount);
            break;
            default:
                break;
        }

        await interaction.reply({
            embeds: [interactionReply]
        });
	},
};

async function depositCoins(interaction, amount) {
    var userProfile = await getUserProfile(interaction);

    if (userProfile.Wallet < amount) {
        return await getDefaultNegativeAnswerEmbed(
            "Bank",
            `You don't have enough :coin: in your wallet!`,
            interaction.user
        );
    }

    await Profile.updateOne(
        { UserID: interaction.user.id },
        { $inc: { Bank: amount } }
    );
    await Profile.updateOne(
        { UserID: interaction.user.id },
        { $inc: { Wallet: -amount } }
    );

    return await getDefaultNeutralAnswerEmbed(
        "Bank",
        `Deposited ${amount} :coin: into your bank account.\n 
        **Wallet:** ${userProfile.Wallet - amount} :coin:\n **Balance:** ${userProfile.Bank += amount} :coin:`
    );
}

async function withdrawCoins(interaction, amount) {
    var userProfile = await getUserProfile(interaction);

    if (userProfile.Bank < amount) {
        return await getDefaultNegativeAnswerEmbed(
            "Bank",
            `You don't have enough :coin: in your bank account!`,
            interaction.user
        );
    }

    await Profile.updateOne(
        { UserID: interaction.user.id },
        { $inc: { Bank: -amount } }
    );
    await Profile.updateOne(
        { UserID: interaction.user.id },
        { $inc: { Wallet: amount } }
    );

    return await getDefaultNeutralAnswerEmbed(
        "Bank",
        `Withdrawn ${amount} :coin: from your bank account.\n 
        **Wallet:** ${userProfile.Wallet += amount} :coin:\n **Balance:** ${userProfile.Bank - amount} :coin:`
    );
}
