const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { discord_log } = require('../../discord_log.js');
const { clientId, guildId, token } = require('../../config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync('./events/interactionCreate/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async() => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), { body: commands },
        );

        discord_log('Successfully registered application commands.');
    } catch (error) {
        discord_log(error);
    }
})();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        discord_log(`<@${interaction.user.id}> in <#${interaction.channel.id}> triggered an \`/${interaction.commandName}${interaction.options.data.length ? ' ' + interaction.options.data[0].value : ''}\` interaction.`);

        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            discord_log(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};