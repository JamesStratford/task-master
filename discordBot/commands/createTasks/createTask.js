const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-task")
    .setDescription("Create a new task!")
    .addStringOption((option) =>
      option
        .setName("task_name")
        .setDescription("Enter the task title")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("column_name") // Change the option name to "column_name"
        .setDescription(
          "Enter the name of the column you want to add this task to" // Update description
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("due_date")
        .setDescription("When will this task be due?")
    )
    .addStringOption((option) =>
      option
        .setName("task_description")
        .setDescription("Enter a description for this task")
    ),

  async execute(interaction) {
    // Identify user
    const userId = interaction.user.id;

    // Get the provided column name
    const columnName = interaction.options.getString("column_name");

    // Fetch the columns from your kanban board API (replace with your actual API endpoint)
    const columns = await axios.get(`${process.env.SERVER_ORIGIN}/api/kanban/get-columns`);

    // Find the column by name
    const column = columns.data.find((col) => col.title === columnName);

    if (!column) {
      await interaction.reply(`Column "${columnName}" not found.`);
      return;
    }

    // Create a new task to be added to the database
    let newCard = {
      taskId: `task-${Date.now()}`,
      content: interaction.options.getString("task_name"),
      due_date: interaction.options.getString("due_date") ?? "",
      description: interaction.options.getString("task_description") ?? "",
      labels: [],
      nextTaskId: "",
    };

    // Add the task to the specified column
    axios.post(`${process.env.SERVER_ORIGIN}/api/kanban/add-task`, {
      columnId: column.id,
      newCard: newCard,
    });

    await interaction.reply(`Your task ${newCard.content} has been created and added to the "${column.title}" column!`);
  },
};
