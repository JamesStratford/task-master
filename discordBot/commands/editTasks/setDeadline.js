const {SlashCommandBuilder} = require("discord.js");
const axios = require("axios");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("set-deadline")
        .setDescription("Sets the deadline for a task")
        .addStringOption(option =>
            option
                .setName("task_id")
                .setDescription("The ID of the task you want to set the deadline for")
                .setRequired(true)
                )
        .addStringOption(option =>
            option
                .setName("due_date")
                .setDescription("The deadline you want to set for the task")
                .setRequired(true)
                ),
    
    async execute(interaction) {

        // Identify user
        const userId = interaction.user.id;

        // Set deadline to task in web server
        
        //waiting for mongoDB integration

        axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/updateTask`, {
            id: interaction.options.getString("task_id"),
            due_date: interaction.options.getString("due_date")
        })

    }

};