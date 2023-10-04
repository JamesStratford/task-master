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
                        
                        interaction.client.removeListener('voiceStateUpdate', voiceStateUpdateHandler);
                    }
                };

                interaction.client.on('voiceStateUpdate', voiceStateUpdateHandler);

                // Check if column with title "Meeting" exists
                let meetingColumn;
                try {
                    const columns = await axios.get('/get-columns'); 
                    meetingColumn = columns.data.find(column => column.title === 'Meeting Minutes');
                } catch (err) {
                    console.error('Error fetching columns:', err);
                    await interaction.reply('Error checking or creating Meeting column.');
                    return;
                }

                // If column with title "Meeting" doesn't exist, create it.
                if (!meetingColumn) {
                    try {
                        const newColumn = { title: 'Meeting Minutes', taskIds: [] };
                        meetingColumn = (await axios.post('/add-column', newColumn)).data;
                    } catch (err) {
                        console.error('Error creating new Meeting column:', err);
                        await interaction.reply('Error checking or creating Meeting column.');
                        return;
                    }
                }

                // Add a new task with content "Meeting" and description as member names
                try {

                        // Format the current date.
                        const currentDate = new Date();
                        const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
                        
                        const newTask = {
                        content: `${formattedDate} Meeting attendees: ${memberNames}`,
                        labels: [],
                    };
                    const createdTask = (await axios.post('/add-task', { newCard: newTask, columnId: meetingColumn.id })).data;
                } catch (err) {
                    console.error('Error adding task:', err);
                    await interaction.reply('Error adding meeting to the Meeting column.');
                }
            } catch (err) {
                console.error("Error fetching members:", err);
                await interaction.reply('There was an error checking attendance.');
            }
        } else {
            await interaction.reply('You need to be in a voice channel for me to check attendance.');
        }
    }
};

