const { SlashCommandBuilder } = require('@discordjs/builders');
const { verification_channel, email_address, email_password } = require('../../../config.json');
var nodemailer = require('nodemailer');
const wait = require('util').promisify(setTimeout);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Apply to the server')
        .addStringOption(option =>
            option.setName('student-id')
            .setDescription('Your NTU student ID')
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

        studentId = interaction.options.data[0].value;
        if (!studentId.match(/^(B|b)[0-9]{2}7050[0-9]{2}$/)) {
            interaction.reply({ content: '學號格式錯誤！', ephemeral: true });
            return;
        }

        if (applications.has(studentId)) {
            interaction.reply({ content: '請勿重複驗證！', ephemeral: true });
            return;
        }

        const time_limit = 300; // seconds

        interaction.reply({ content: `驗證碼已寄到你的信箱：${'b' + studentId.substring(1)}@ntu.edu.tw，請在 ${time_limit} 秒內完成驗證。`, ephemeral: true });
        verification_code = (Math.random() + 1).toString(36).toUpperCase().substring(2); // random string
        applications.set(interaction.user.id, { studentId, verification_code });

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email_address,
                pass: email_password
            }
        });
        mailOptions = {
            from: email_address,
            to: `${'b' + studentId.substring(1)}@ntu.edu.tw`,
            subject: '台大資管系 Discord 線上系空間認證信',
            html: `<h4>此信件為台大資管系 Discord 線上系空間認證信，</h4>\
                   <h4>若你沒有申請加入，請無視此信件。</h4>\
                   <br>
                   <p>歡迎你申請加入台大資管系 Discord 線上系空間！</p>\
                   <p>驗證碼：${verification_code}</p>\
                   <p>請回到 Discord 驗證頻道，並以 <code>/verify</code> 指令回覆此驗證碼。</p>`
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        await wait(time_limit * 1000);
        await applications.delete(studentId);
        await interaction.followUp({ content: '已逾時，請重新驗證！', ephemeral: true });
    },
};