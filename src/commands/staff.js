const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('Staff management commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new staff member')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to add as staff')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a staff member')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to remove from staff')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all staff members'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('top')
                .setDescription('View top performing staff members')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(user.id);
            const staffRole = interaction.guild.roles.cache.find(r => r.name === config.supportRole);

            if (!staffRole) {
                return interaction.reply({
                    content: 'Support Staff role not found! Please create it first.',
                    ephemeral: true
                });
            }

            await member.roles.add(staffRole);
            await db.set(`staff_${user.id}`, {
                addedBy: interaction.user.id,
                addedAt: Date.now(),
                active: true
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Staff Member Added')
                .setDescription(`${user} has been added to the support staff team.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        else if (subcommand === 'remove') {
            const user = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(user.id);
            const staffRole = interaction.guild.roles.cache.find(r => r.name === config.supportRole);

            if (staffRole && member.roles.cache.has(staffRole.id)) {
                await member.roles.remove(staffRole);
            }

            await db.delete(`staff_${user.id}`);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Staff Member Removed')
                .setDescription(`${user} has been removed from the support staff team.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        else if (subcommand === 'list') {
            const staffRole = interaction.guild.roles.cache.find(r => r.name === config.supportRole);
            if (!staffRole) {
                return interaction.reply({
                    content: 'Support Staff role not found!',
                    ephemeral: true
                });
            }

            const staffMembers = staffRole.members;
            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('Support Staff List')
                .setDescription(staffMembers.size === 0 ? 'No staff members found.' : '')
                .addFields(
                    staffMembers.map(member => ({
                        name: member.user.tag,
                        value: member.presence?.status || 'offline',
                        inline: true
                    }))
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        else if (subcommand === 'top') {
            const staffRole = interaction.guild.roles.cache.find(r => r.name === config.supportRole);
            if (!staffRole) {
                return interaction.reply({
                    content: 'Support Staff role not found!',
                    ephemeral: true
                });
            }

            const staffStats = [];
            for (const member of staffRole.members.values()) {
                const stats = await db.get(`staffStats_${member.id}`) || {
                    totalSessions: 0,
                    positiveRatings: 0,
                    negativeRatings: 0,
                    totalTime: 0
                };
                staffStats.push({
                    member: member,
                    stats: stats
                });
            }

            staffStats.sort((a, b) => b.stats.positiveRatings - a.stats.positiveRatings);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('Top Support Staff')
                .setDescription('Ranked by positive ratings')
                .addFields(
                    staffStats.slice(0, 5).map((staff, index) => ({
                        name: `${index + 1}. ${staff.member.user.tag}`,
                        value: `👍 ${staff.stats.positiveRatings} | 👎 ${staff.stats.negativeRatings} | ⏰ ${Math.floor(staff.stats.totalTime / 60000)}m`
                    }))
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};
