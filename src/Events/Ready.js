const { Events, ActivityType } = require('discord.js');
const mongoose =  require('mongoose');
const mongoURL = process.env.mongoURL

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        client.user.setPresence({ activities: [{ name: 'shiba play', type: ActivityType.Watching }], status: 'online'});

        if (!mongoURL) return;

        await mongoose.connect(mongoURL || "");

        if (mongoose.connect) {
            console.log("Connected to database");
        } else {
            console.log("Can't connect to database")
        }
	},
};