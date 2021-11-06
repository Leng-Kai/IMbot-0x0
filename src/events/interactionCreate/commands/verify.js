const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { discord_log } = require('../../../discord_log.js');
const { verification_channel, ntuim_role, everyone_role } = require('../../../config.json');
const wait = require('util').promisify(setTimeout);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Enter verification code')
        .addStringOption(option =>
            option.setName('verification-code')
            .setDescription('Your verification code')
            .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.channelId !== verification_channel) {
            await interaction.editReply({ content: '此指令只能於驗證頻道使用！', ephemeral: true });
            return;
        }

        if (interaction.options.data.length != 1) {
            await interaction.editReply({ content: 'Unexpected error.', ephemeral: true });
            return;
        }

        verification_code_enter = interaction.options.data[0].value;

        if (!applications.has(interaction.user.id)) {
            await interaction.editReply({ content: '請先申請驗證！', ephemeral: true });
            return;
        }

        const { applyToken, verification_code, tokenType } = applications.get(interaction.user.id);
        if (verification_code_enter !== verification_code) {
            await interaction.editReply({ content: '驗證碼錯誤！', ephemeral: true });
            return;
        }

        await applications.delete(interaction.user.id);
        await interaction.editReply({ content: '驗證成功！\n你現在可以在左側的身份組頻道選擇想要的身份組。', ephemeral: true });

        const guild = interaction.guild;
        const member = guild.members.cache.get(interaction.user.id);
        try {
            member.roles.add(ntuim_role);
        } catch (err) {
            discord_log('Error adding role', err);
            return;
        }

        if (tokenType === 1) {
            const role_name = 'B' + applyToken.substring(1, 3);
            role = await guild.roles.cache.find((role) => role.name === role_name);

            if (!role) {
                await guild.roles.create({
                    name: role_name,
                    color: 'WHITE'
                })

                role = await guild.roles.cache.find((role) => role.name === role_name);

                try {
                    guild.channels.create(role_name, {
                        type: 'GUILD_CATEGORY',
                        permissionOverwrites: [{
                            id: everyone_role,
                            deny: [Permissions.FLAGS.VIEW_CHANNEL]
                        }, {
                            id: role.id,
                            allow: [Permissions.FLAGS.VIEW_CHANNEL]
                        }]
                    }).then(category => {
                        guild.channels.create('閒聊', {
                            type: 'GUILD_TEXT',
                            parent: category.id
                        });
                    });
                } catch (err) {
                    discord_log('Error creating category', err);
                    return;
                }
            }

            await wait(3000);

            try {
                member.roles.add(role.id);
            } catch (err) {
                discord_log('Error adding role', err);
                return;
            }
        }
    },
};