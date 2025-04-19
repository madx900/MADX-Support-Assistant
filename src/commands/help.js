const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('MADX Support Assistant Help')
            .setDescription('Here are all the available commands:')
            .addFields(
                { name: '/help', value: 'Shows this help message' },
                { name: '/support', value: 'Creates a support ticket' }
            )
            .setFooter({ text: 'MADX Support Assistant' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
