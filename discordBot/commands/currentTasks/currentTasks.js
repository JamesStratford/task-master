const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("get-tasks")
        .setDescription("Replies a list of current tasks in order of priority"),

    async execute(interaction) {
        // Identify user
        const userId = interaction.user.id;

        // Get tasks from web server
        try {
            const response = await axios.get(`${process.env.SERVER_ORIGIN}/api/discord-bot/kanban/getTasks?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.SERVER_AUTH_TOKEN}`
                }
            });
            const tasks = response.data.tasks;

            // Sort tasks by priority
            tasks.sort((a, b) => a.priority - b.priority);

            // Reply with the list of tasks
            const taskList = tasks.map((task, index) => `${index + 1}. ${task.description} (Priority: ${task.priority})`).join('\n');

            if (taskList) {
                await interaction.reply(`Here are your tasks:\n${taskList}`);
            } else {
                await interaction.reply("You have no tasks!");
            }
        } catch (error) {
            console.error("Error fetching tasks: ", error.message);
            await interaction.reply("Sorry, something went wrong while fetching your tasks.");
        }
    }
};