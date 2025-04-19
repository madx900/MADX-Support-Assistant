const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Support system commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('request')
                .setDescription('Request support assistance')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for support request')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('available')
                .setDescription('Set yourself as available for support')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unavailable')
                .setDescription('Set yourself as unavailable for support')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View support statistics')
                .addUserOption(option =>
                    option.setName('staff')
                        .setDescription('Staff member to view stats for'))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const supportSystem = interaction.client.supportSystem;

        if (subcommand === 'request') {
            const reason = interaction.options.getString('reason');
            const added = await supportSystem.addToWaitingList(interaction.user, reason);

            if (!added) {
                return interaction.reply({
                    content: 'You are already in the waiting list!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Support Request')
                .setDescription(config.messages.joinWaitingList)
                .addFields(
                    { name: 'Position', value: supportSystem.waitingList.length.toString() },
                    { name: 'Estimated Wait', value: supportSystem.getAverageWaitTime() }
                );

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        else if (subcommand === 'available') {
            const staffRole = interaction.guild.roles.cache.find(r => r.name === config.supportRole);
            if (!interaction.member.roles.cache.has(staffRole.id)) {
                return interaction.reply({
                    content: 'You must have the Support Staff role to use this command!',
                    ephemeral: true
                });
            }

            await interaction.member.roles.add(staffRole);
            await interaction.reply({
                content: 'You are now marked as available for support!',
                ephemeral: true
            });
        }

        else if (subcommand === 'unavailable') {
            const staffRole = interaction.guild.roles.cache.find(r => r.name === config.supportRole);
            if (!interaction.member.roles.cache.has(staffRole.id)) {
                return interaction.reply({
                    content: 'You must have the Support Staff role to use this command!',
                    ephemeral: true
                });
            }

            await interaction.member.roles.remove(staffRole);
            await interaction.reply({
                content: 'You are now marked as unavailable for support!',
                ephemeral: true
            });
        }

        else if (subcommand === 'stats') {
            const target = interaction.options.getUser('staff') || interaction.user;
            const stats = await interaction.client.db.get(`staffStats_${target.id}`) || {
                totalSessions: 0,
                positiveRatings: 0,
                negativeRatings: 0,
                totalTime: 0
            };

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(`Support Statistics for ${target.tag}`)
                .addFields(
                    { name: 'Total Sessions', value: stats.totalSessions.toString() },
                    { name: 'Positive Ratings', value: stats.positiveRatings.toString() },
                    { name: 'Negative Ratings', value: stats.negativeRatings.toString() },
                    { name: 'Total Support Time', value: `${Math.floor(stats.totalTime / 60000)} minutes` },
                    { name: 'Rating Ratio', value: `${(stats.positiveRatings / (stats.totalSessions || 1) * 100).toFixed(1)}%` }
                );

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};
