const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
require("dotenv").config({ path: "frontend/.env" });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-deadline")
    .setDescription("Sets the deadline for a task")
    .addStringOption((option) =>
      option
        .setName("task_id")
        .setDescription("The ID of the task you want to set the deadline for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("due_date")
        .setDescription("The deadline you want to set for the task")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Identify user
    const userId = interaction.user.id;

    // Check if due_date is valid

    const dateFormatRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dateFormatRegex.test(interaction.options.getString("due_date"))) {
      await interaction.reply("Please use the format DD/MM/YYYY");
    } else {
      // Set deadline to task in web server

      try {
        axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
          newTask: {
            taskId: interaction.options.getString("task_id"),
            due_date: interaction.options.getString("due_date"),
          },
        });

        await interaction.reply(
          `Your task has been assigned the due date: ${interaction.options.getString(
            "due_date"
          )}`
        );
      } catch (error) {
        console.error("Error fetching tasks: ", error.message);
        await interaction.reply(
          "Sorry, something went wrong while updating your task."
        );
      }
    }
  },
};
