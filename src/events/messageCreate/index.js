const { discord_log } = require('../../discord_log.js');
const { verification_channel, role_channel } = require("../../config.json");

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || (message.channelId !== verification_channel && message.channelId !== role_channel)) {
            return;
        }

        discord_log(`<@${message.author.id}> sent a message in <#${message.channelId}>`);
        message.delete();
    },
};