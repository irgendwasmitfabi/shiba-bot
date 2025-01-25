const Trophy = require('../Models/Trophy');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    getTrophyById: async function getTrophyById(id) {
        try {
            return await Trophy.findOne({Id: id});
        } catch (error) {
            console.log(error);
        }
    },
    getTrophiesEmbed: async function getTrophiesEmbed(title, description, color, user) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
};