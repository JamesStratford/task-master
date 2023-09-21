const { SlashCommandBuilder } = require('discord.js');

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

                // Display "Meeting Start:" before displaying the users in the call
                await interaction.reply(`Meeting Start...\n\nUsers in the call: ${memberNames}`);

                // Step 1: Define a Set to track members
                const initialMembers = new Set(members.keys());

                // Step 2: Add event listener for the voiceStateUpdate event
                const voiceStateUpdateHandler = (oldState, newState) => {
                    // If the member left the voice channel
                    if (oldState.channelId === voiceChannel.id && !newState.channelId) {
                        initialMembers.delete(oldState.id);
                    }

                    // Step 3: Check if the voice channel becomes empty
                    if (initialMembers.size === 0) {
                        // Update the "Meeting adjourned" message to include the usernames
                        interaction.channel.send(`Meeting Ended...\n\n Attendance for ${memberNames} has been marked.`);

                        // Cleanup: Remove the event listener after sending the message
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
