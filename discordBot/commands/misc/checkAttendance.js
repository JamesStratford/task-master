const { SlashCommandBuilder, MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-attendance")
    .setDescription("Check attendance of members in a voice channel and add as a task to the kanban board."),

  async execute(interaction) {
    // Check if the member is in a voice channel
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply('You must be in a voice channel to use this command.');
      return;
    }

    let attendees = voiceChannel.members.map(member => member.id);
    
    let meetingColumnId;

    // Check if the "meeting" column exists
    try {
      const columnsResponse = await axios.get(`${process.env.SERVER_ORIGIN}/api/kanban/getColumns`);
      const meetingColumn = columnsResponse.data.find(col => col.title === "meeting");

      if (!meetingColumn) {
        // Create the column if it doesn't exist
        const newColumnData = {
          title: "meeting",
          tasks: [],
          nextColumnId: null // assuming it's added to the end
        };

        const columnResponse = await axios.post(`${process.env.SERVER_ORIGIN}/api/kanban/add-column`, newColumnData);
        meetingColumnId = columnResponse.data.id;
      } else {
        meetingColumnId = meetingColumn.id;
      }
    } catch (error) {
      console.error("Error fetching or creating the meeting column:", error);
      await interaction.reply({ content: "Error fetching or creating the meeting column. Please try again." });
      return;
    }

    // Create the task and assign it to the "meeting" column
    const newCard = {
      taskId: `task-${Date.now()}`,
      content: `Meeting: ${attendees.join(', ')}`,
      startDate: new Date().toISOString(),
      dueDate: "", 
      description: "", 
      labels: [], 
      nextTaskId: null, 
      assignedUser: "" 
    };

    try {
      await axios.post(`${process.env.SERVER_ORIGIN}/api/kanban/add-task`, { newCard: newCard, columnId: meetingColumnId });
      
      const successEmbed = new MessageEmbed()
        .setColor("#00FF00")
        .setTitle("Attendance Checked")
        .setDescription(`Meeting attendees: ${attendees.join(', ')} have been added as a task in the 'meeting' column!`);
      
      await interaction.reply({ embeds: [successEmbed] });
    } catch(error) {
      console.error("Error adding task:", error);
      
      const errorEmbed = new MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription("There was an error adding the task to the 'meeting' column. Please try again.");

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
