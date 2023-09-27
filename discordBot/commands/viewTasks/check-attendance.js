const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-attendance')
        .setDescription('Checks and lists all users in the voice call'),

    async execute(interaction) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (voiceChannel) {
            try {
                const members = voiceChannel.members.filter(m => !m.user.bot);
                const memberNames = members.map(m => m.displayName).join(', ');

                await interaction.reply(`Meeting Start...\n\nUsers in the call: ${memberNames}`);

                const initialMembers = new Set(members.keys());

                const voiceStateUpdateHandler = (oldState, newState) => {
                    if (oldState.channelId === voiceChannel.id && !newState.channelId) {
                        initialMembers.delete(oldState.id);
                    }

                    if (initialMembers.size === 0) {
                        interaction.channel.send(`Meeting Ended...\n\n Attendance for ${memberNames} has been marked.`);
                        
                        // Call the handleMeetingEnd function with memberNames as the attendees argument
                        handleMeetingEnd(memberNames);

                        interaction.client.removeListener('voiceStateUpdate', voiceStateUpdateHandler);
                    }
                };

                interaction.client.on('voiceStateUpdate', voiceStateUpdateHandler);
            } catch (err) {
                console.error("Error fetching members:", err);
                await interaction.reply('There was an error checking attendance.');
            }
        } else {
            await interaction.reply('You need to be in a voice channel for me to check attendance.');
        }
    }
};
