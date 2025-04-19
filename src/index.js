const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { QuickDB } = require('quick.db');
const fs = require('fs');
const path = require('path');
const SupportSystem = require('./systems/supportSystem');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ]
});

client.commands = new Collection();
client.db = new QuickDB();
client.supportSystem = new SupportSystem(client);

// Command handler
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Event handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Button interaction handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'viewWaitingList') {
        const waitingList = client.supportSystem.waitingList;
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('Current Waiting List')
            .setDescription(waitingList.length === 0 ? 'No users waiting.' : '')
            .addFields(
                waitingList.map((user, index) => ({
                    name: `${index + 1}. ${client.users.cache.get(user.userId)?.tag || 'Unknown User'}`,
                    value: `Reason: ${user.reason}\nWaiting: ${Math.floor((Date.now() - user.timestamp) / 60000)} minutes`
                }))
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});

client.login(process.env.TOKEN);
