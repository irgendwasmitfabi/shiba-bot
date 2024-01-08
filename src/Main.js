const { Client, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

console.log(process.env.token);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.token);