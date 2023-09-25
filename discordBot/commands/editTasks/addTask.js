const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const schedule = require("node-schedule");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-task")
        .setDescription("Add a new task into the Kanban Board")
        .addSubcommand(command => command
            .addStringOption(option => option
                .setName('title')
                .setDescription('Set your task title')
                .setRequired(true))
            .addStringOption(option => option
                .setName('column')
                .setDescription('What column do you want to set this task into')
                .setRequired(true)
            )
        ),
    /*async execute(interaction) {
        // Get task data from user's input
        const userId = interaction.user.id;3
        const taskTitle = interaction.options.getString('title');
        const intoColumn = interaction.options.getString('column');

        // Send the task data to your web server to add the task
        try {
            const response = await axios.post(`${process.env.SERVER_ORIGIN}/api/discord-bot/kanban/addTask`, {
                userId: userId,
                description: taskDescription,
                priority: taskPriority,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.SERVER_AUTH_TOKEN}`
                }
            });

            // Check if the task was added successfully
            if (response.data.success) {
                await interaction.reply(`Task added: ${taskDescription} (Priority: ${taskPriority})`);
            } else {
                await interaction.reply("Failed to add the task. Please try again.");
            }
        } catch (error) {
            console.error("Error adding task: ", error.message);
            await interaction.reply("Sorry, something went wrong while adding the task.");
        }
    }*/
};
