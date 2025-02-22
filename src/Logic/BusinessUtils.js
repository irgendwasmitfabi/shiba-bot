const Business = require('../Models/Business');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    getBusinessById: async function getBusinessById(id) {
        try {
            return await Business.findOne({Id: id});
        } catch (error) {
            console.log(error);
        }
    },
    getBusinessesEmbed: async function getBusinessesEmbed(title, description, color, user) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `${user.username}`, iconURL: `${user.displayAvatarURL()}` });
    },
};