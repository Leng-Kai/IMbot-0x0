const { verification_channel } = require("../../config.json");

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || message.channelId !== verification_channel) {
            return;
        }

        await message.delete();
    },
};