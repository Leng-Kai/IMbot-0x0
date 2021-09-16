const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
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
        if (interaction.channelId !== verification_channel) {
            interaction.reply({ content: '此指令只能於驗證頻道使用！', ephemeral: true });
            return;
        }

        if (interaction.options.data.length != 1) {
            interaction.reply({ content: 'Unexpected error.', ephemeral: true });
            return;
        }

        verification_code_enter = interaction.options.data[0].value;

        if (!applications.has(interaction.user.id)) {
            interaction.reply({ content: '請先申請驗證！', ephemeral: true });
            return;
        }

        const { studentId, verification_code } = applications.get(interaction.user.id);
        if (verification_code_enter !== verification_code) {
            interaction.reply({ content: '驗證碼錯誤！', ephemeral: true });
            return;
        }

        interaction.reply({ content: '驗證成功！\n你現在可以在左側的身份組頻道選擇想要的身份組。', ephemeral: true });

        const role_name = 'B' + studentId.substring(1, 3);
        const guild = interaction.guild;
        const member = guild.members.cache.get(interaction.user.id);
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
                console.error('Error creating category', err);
                return;
            }
        }

        await wait(3000);

        try {
            member.roles.add(ntuim_role);
        } catch (err) {
            console.error('Error adding role', err);
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