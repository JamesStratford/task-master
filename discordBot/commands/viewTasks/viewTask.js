const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("view-task")
        .setDescription("Displays task!")
        .addStringOption(option => 
            option
                .setName("task-id")
                .setDescription("The ID of the task to view.")
                .setRequired(true)
        ),
    
    async execute(interaction) {

        try {
            
            const tasks = axios.get(`${process.env.SERVER_ORIGIN}/api/kanban/get-tasks`)
    
            const task = tasks.find(task => task.taskId === interaction.options.getString("task-id"))
    
            await interaction.reply(`Task: ${task.content}\ndescription: ${task.description}`)

        } catch (error) {

            console.error("Error fetching tasks: ", error.message);
            await interaction.reply("Sorry, something went wrong while fetching your task.");
            
        }
        

    }

};