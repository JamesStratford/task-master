const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-attendance')
        .setDescription('Checks and lists all users in the voice call'),

    async execute(interaction) {
        // Get the member who executed the command
        const member = interaction.member;

        // Use the guild's voice states to get the voice channel of the member
        const voiceChannel = interaction.guild.voiceStates.cache.get(member.id)?.channel;

        if (voiceChannel) {
            try {
                // Fetch all members in the voice channel
                const members = voiceChannel.members.filter(m => !m.user.bot);  // Filter out bots

                // Convert members collection to a list of usernames
                const memberNames = members.map(m => m.user.username).join(', ');

                // Send a message with the list of usernames
                await interaction.reply(`Users in the call: ${memberNames}`);
            } catch (err) {
                console.error("Error fetching members:", err);
                await interaction.reply('There was an error checking attendance.');
            }
        } else {
            // If the member is not in a voice channel, send an error message
            await interaction.reply('You need to be in a voice channel for me to check attendance.');
        }
    }
};
