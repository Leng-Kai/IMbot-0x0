const { SlashCommandBuilder } = require('@discordjs/builders');
const { discord_log } = require('../../../discord_log.js');
const { channel_binded_roles } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getrole')
        .setDescription('Get corresponding role of current channel'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        const member = guild.members.cache.get(interaction.user.id);
        const role = await guild.roles.cache.find((role) => role.id === channel_binded_roles[interaction.channelId]);
        if (!role) {
            await interaction.editReply({ content: '此指令無法在此頻道使用！', ephemeral: true });
            return;
        }

        discord_log(`<@${interaction.user.id}> gets <@&${role.id}> role.`)
        try {
            await member.roles.add(role.id);
        } catch (err) {
            discord_log('Error adding role', err);
            return;
        }

        await interaction.editReply({ content: `你已獲得 <@&${role.id}> 身份組。`, ephemeral: true });
    },
};