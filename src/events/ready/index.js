const { discord_log } = require('../../discord_log.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        discord_log(`Ready! Logged in as ${client.user.tag}`);
    },
};