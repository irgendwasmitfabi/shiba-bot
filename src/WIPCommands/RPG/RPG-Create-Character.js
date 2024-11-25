var { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");
var RPGClasses = require("../../Models/RPG/RPGClasses");
var { createClass } = require('../../Logic/RPG/Utils');

var { getCreateCharacterEmbed, getCreateCharacterErrorEmbed, getClassesEmbed } = require("../../Logic/RPG/Embed");
var { getArrowRightButton, getArrowLeftButton } = require("../../Logic/RPG/Buttons");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rpg-create-character")
        .setDescription("Create your own character for your adventure")
        .addStringOption((option) =>
        option
            .setName("name")
            .setDescription("Choose a name for your character!")
            .setRequired(true)
    ),
    async execute(interaction) {
        var userId = interaction.user.id;

        var characterName = interaction.options.getString("name");

        if (!characterName) {
            var createCharacterErrorEmbed = await getCreateCharacterErrorEmbed();

            return await interaction.reply({
                embeds: [createCharacterErrorEmbed],
            });
        }

        var createCharacterEmbed = await getCreateCharacterEmbed();

        var arrowLeft = await getArrowLeftButton()
        var arrowRight = await getArrowRightButton()

        var arrowButtonRow = new ActionRowBuilder()
			.addComponents(arrowLeft, arrowRight);

        var currentClassPage = 0;
        var classEmbeds = await getClassEmbeds()
            
        var response = await interaction.reply({
            embeds: [classEmbeds[currentClassPage]],
            components: [arrowButtonRow],
        });

        var collectorFilter = i => i.user.id === interaction.user.id;
        try {
            var confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            if (confirmation.customId === 'arrowleft') {
                currentClassPage -= 1;
                await confirmation.update({ embeds: [classEmbeds[currentClassPage]], components: [arrowButtonRow] });
            } else if (confirmation.customId === 'arrowright') {
                currentClassPage += 1;
                await confirmation.update({ embeds: [classEmbeds[currentClassPage]], components: [arrowButtonRow] });
            }
            console.log(classEmbeds);
            console.log(currentClassPage);
        } catch {
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
    },
};
async function getClassEmbeds() {
    var classNames = ["Bard", "Barbarian", "Rogue", "Paladin", "Monk"]
    var classEmbeds = [];

    for (var i = 0; i < classNames.length; i++) {
        var classType = await RPGClasses.find({
            Name: classNames[i]
        });
        
        if (classType.length) {
            var classEmbed = await getClassesEmbed(classType[0]);
            classEmbeds.push(classEmbed);
        }
    }

    return classEmbeds;
}
