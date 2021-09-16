const { role_channel, role_message, roles } = require("../../config.json");

module.exports = {
    name: 'messageReactionAdd',
    async execute({ message, _emoji }, user) {
        if (user.bot || message.id !== role_message) {
            return;
        }

        const guild = message.guild;
        const member = guild.members.cache.get(user.id);
        const role = guild.roles.cache.find((role) => role.name === roles[_emoji]);

        if (!role) {
            console.error(`Role not found for '${_emoji.name}'`);
            return;
        }

        try {
            member.roles.add(role.id);
        } catch (err) {
            console.error('Error adding role', err);
            return;
        }
    },
};