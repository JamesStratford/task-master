const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-attendance")
    .setDescription("Check attendance of members in a voice channel and add as a task to the kanban board."),

  async execute(interaction) {
    // Check if the member is in a voice channel
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply('You must be in a voice channel to use this command.');
      return;
    }

    // Fetch the Discord display names of attendees instead of their IDs
    let attendeeNames = voiceChannel.members.map(member => member.displayName);

    // Format the current date to a readable string: e.g., "Oct 24, 2023"
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

    let meetingColumnId;

    // Check if the "Meeting" column exists
    try {
      const columnsResponse = await axios.get(`${process.env.SERVER_ORIGIN}/api/kanban/get-columns`);
      const meetingColumn = columnsResponse.data.find(col => col.title === "Meetings");

      if (!meetingColumn) {
        // Create the column if it doesn't exist
        const newColumnData = {
          title: "Meetings",
          tasks: [],
          nextColumnId: null // assuming it's added to the end
        };

        const columnResponse = await axios.post(`${process.env.SERVER_ORIGIN}/api/kanban/add-column`, newColumnData);
        meetingColumnId = columnResponse.data.id;
      } else {
        meetingColumnId = meetingColumn.id;
      }
    } catch (error) {
      console.error("Error fetching or creating the Meetings column:", error);
      await interaction.reply("Error fetching or creating the Meetings column. Please try again.");
      return;
    }

    // Create the task and assign it to the "Meeting" column
    const newCard = {
      taskId: `task-${Date.now()}`,
      content: `Meeting on: ${formattedDate}`,
      startDate: "", 
      dueDate: "",
      description: `Attendees: ${attendeeNames.join(', ')}`,  // Moved attendees info to the description
      labels: [], 
      nextTaskId: null, 
      assignedUser: "" 
    };

    try {
      await axios.post(`${process.env.SERVER_ORIGIN}/api/kanban/add-task`, { newCard: newCard, columnId: meetingColumnId });
      
      if (attendeeNames.length === 1) {
        await interaction.reply(`The Meeting attendee on ${formattedDate}: ${attendeeNames.join(', ')} has been added as a task in the 'Meetings' column!`);
      } else {
        await interaction.reply(`Meeting attendees for ${formattedDate}: ${attendeeNames.join(', ')} have been added as a task in the 'Meetings' column!`);
      }
    } catch(error) {
      console.error("Error adding task:", error);
      await interaction.reply("There was an error adding the task to the 'Meetings' column. Please try again.");
    }
  },
};
