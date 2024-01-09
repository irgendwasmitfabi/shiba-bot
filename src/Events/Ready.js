const { Events } = require('discord.js');
const mongoose =  require('mongoose');
const mongoURL = process.env.mongoURL

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        if (!mongoURL) return;

        await mongoose.connect(mongoURL || "", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        if (mongoose.connect) {
            console.log("Connected to database");
        } else {
            console.log("Can't connect to database")
        }
	},
};