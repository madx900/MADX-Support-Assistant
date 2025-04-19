const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const path = require('path');
const config = require('../config');
const db = new QuickDB();

class SupportSystem {
    constructor(client) {
        this.client = client;
        this.waitingList = [];
        this.activeSessions = new Map();
        this.lastSoundPlayed = 0;
        this.audioPlayer = createAudioPlayer();
    }

    async addToWaitingList(user, reason) {
        if (this.waitingList.find(w => w.userId === user.id)) {
            return false;
        }

        this.waitingList.push({
            userId: user.id,
            reason: reason,
            timestamp: Date.now()
        });

        await this.notifyStaff();
        this.playNotificationSound();
        return true;
    }

    async notifyStaff() {
        const channel = this.client.channels.cache.get(config.waitingRoomId);
        if (!channel) return;

        const staffRole = channel.guild.roles.cache.find(r => r.name === config.supportRole);
        if (!staffRole) return;

        const embed = new EmbedBuilder()
            .setColor('#FF9900')
            .setTitle('Support Needed!')
            .setDescription(config.messages.staffNotification)
            .addFields(
                { name: 'Waiting Users', value: this.waitingList.length.toString() },
                { name: 'Wait Time', value: this.getAverageWaitTime() }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('viewWaitingList')
                    .setLabel('View Waiting List')
                    .setStyle(ButtonStyle.Primary)
            );

        await channel.send({
            content: `${staffRole}`,
            embeds: [embed],
            components: [row]
        });
    }

    async playNotificationSound() {
        if (Date.now() - this.lastSoundPlayed < config.soundRepeatDelay) return;

        const channel = this.client.channels.cache.get(config.waitingRoomId);
        if (!channel) return;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const resource = createAudioResource(path.join(__dirname, '../../assets/sounds', config.notificationSound));
        connection.subscribe(this.audioPlayer);
        this.audioPlayer.play(resource);
        this.lastSoundPlayed = Date.now();
    }

    getAverageWaitTime() {
        if (this.waitingList.length === 0) return 'No waiting users';
        const totalWait = this.waitingList.reduce((acc, curr) => {
            return acc + (Date.now() - curr.timestamp);
        }, 0);
        const avgWait = totalWait / this.waitingList.length;
        return Math.floor(avgWait / 60000) + ' minutes';
    }

    async startSession(staffMember, user) {
        const session = {
            staffId: staffMember.id,
            userId: user.id,
            startTime: Date.now(),
            ratings: null
        };

        this.activeSessions.set(user.id, session);
        this.waitingList = this.waitingList.filter(w => w.userId !== user.id);
        await this.logSession('started', session);
    }

    async endSession(userId, rating, reason) {
        const session = this.activeSessions.get(userId);
        if (!session) return;

        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        session.rating = rating;
        session.ratingReason = reason;

        await this.logSession('ended', session);
        await this.updateStaffStats(session);
        this.activeSessions.delete(userId);
    }

    async logSession(type, session) {
        const logChannel = this.client.channels.cache.get(config.supportLogId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(type === 'started' ? '#00FF00' : '#FF0000')
            .setTitle(`Support Session ${type.charAt(0).toUpperCase() + type.slice(1)}`)
            .addFields(
                { name: 'Staff Member', value: `<@${session.staffId}>` },
                { name: 'User', value: `<@${session.userId}>` },
                { name: 'Duration', value: session.duration ? Math.floor(session.duration / 60000) + ' minutes' : 'Ongoing' }
            );

        if (type === 'ended' && session.rating) {
            embed.addFields(
                { name: 'Rating', value: session.rating === 'positive' ? '👍' : '👎' },
                { name: 'Feedback', value: session.ratingReason || 'No feedback provided' }
            );
        }

        await logChannel.send({ embeds: [embed] });
    }

    async updateStaffStats(session) {
        const stats = await db.get(`staffStats_${session.staffId}`) || {
            totalSessions: 0,
            positiveRatings: 0,
            negativeRatings: 0,
            totalTime: 0
        };

        stats.totalSessions++;
        stats.totalTime += session.duration;
        if (session.rating === 'positive') stats.positiveRatings++;
        if (session.rating === 'negative') stats.negativeRatings++;

        await db.set(`staffStats_${session.staffId}`, stats);
    }
}

module.exports = SupportSystem;
