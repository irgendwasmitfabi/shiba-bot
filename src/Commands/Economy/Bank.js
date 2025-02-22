const { getDefaultNeutralAnswerEmbed, getDefaultNegativeAnswerEmbed } = require('../../Logic/Embed');
const { checkForUserProfile } = require('../../Logic/Utils');
const { SlashCommandBuilder } = require('discord.js');
const Profile = require('../../Models/Profile');

const formatter = new Intl.NumberFormat('us-US');

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
        var userProfile = await checkForUserProfile(interaction);
        
        var interactionReply;

        var amount = parseInt(interaction.options.getString("amount"));
        var bankAction = interaction.options.getString("action");
        switch (bankAction) {
            case "deposit":
                interactionReply = await depositCoins(interaction, amount, userProfile);
                break;
            case "withdraw":
                interactionReply = await withdrawCoins(interaction, amount, userProfile);
            break;
            default:
                break;
        }

        await interaction.reply({
            embeds: [interactionReply]
        });
	},
};

async function depositCoins(interaction, amount, userProfile) {
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
        `Deposited ${formatter.format(amount)} :coin: into your bank account.\n 
        **Wallet:** ${formatter.format(userProfile.Wallet - amount)} :coin:\n **Balance:** ${formatter.format(userProfile.Bank += amount)} :coin:`
    );
}

async function withdrawCoins(interaction, amount, userProfile) {
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
        `Withdrawn ${formatter.format(amount)} :coin: from your bank account.\n 
        **Wallet:** ${formatter.format(userProfile.Wallet += amount)} :coin:\n **Balance:** ${formatter.format(userProfile.Bank - amount)} :coin:`
    );
}
