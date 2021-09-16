const fs = require('fs');
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

intents = [
    Intents.FLAGS.GUILDS,
    // Intents.FLAGS.GUILD_MEMBERS
    // Intents.FLAGS.GUILD_BANS
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    // Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING
];

partials = [
    'MESSAGE',
    'CHANNEL',
    'REACTION'
];

const client = new Client({ intents: intents, partials: partials });

const eventTypes = fs.readdirSync('./events');

for (const type of eventTypes) {
    const event = require(`./events/${type}/index.js`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

global.applications = new Map();

client.login(token);