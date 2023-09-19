const {SlashCommandBuilder} = require("discord.js");
const axios = require("axios");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("set-deadline")
        .setDescription("Sets the deadline for a task"),
        .addStringOption(option =>
            option
                .setName("TaskID")
                .setDescription("The ID of the task you want to set the deadline for")
                .setRequired(true)),
        .addStringOption(option =>
            option
                .setName("Deadline")
                .setDescription("The deadline you want to set for the task")
                .setRequired(true)),
    
    async execute(interaction) {

        // Identify user
        const userId = interaction.user.id;

        // Set deadline to task in web server
        try {
            const response = await axios.post(
                `${process.env.SERVER_ORIGIN}/api/discord-bot/kanban/getTasks?userId=${userId}`, 
                {
                    userId,
                    interaction.options.getString("Deadline"),
                },
                {
                    headers: {
                        "Authorization": `Bearer ${process.env.SERVER_AUTH_TOKEN}`,
                    },
                });

                if (response.data.success) {

                    await interaction.reply("Deadline set!");

                } else {

                    await interaction.reply("Sorry, something went wrong while setting your deadline.");

                }

            } catch (error) {

                console.error("Error setting deadline: ", error.message);
                await interaction.reply("Sorry, something went wrong while setting your deadline.");

            }

    }

};