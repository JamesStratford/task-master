const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
        .setName("column_name")
        .setDescription("Enter the column you want to add this task to")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("due_date").setDescription("When will this task be due?")
    )
    .addStringOption((option) =>
      option.setName("start_date").setDescription("When will this task start?")
    )
    .addStringOption((option) =>
      option
        .setName("task_description")
        .setDescription("Enter a description for this task")
    ),

  async execute(interaction) {
    // Identify user
    const userId = interaction.user.id;

    // Get the provided column name or use a default value (e.g., the first column name)
    const columnName = interaction.options.getString("column_name");

    // Fetch the columns from your kanban board API (replace with your actual API endpoint)
    const columns = await axios.get(
      `${process.env.SERVER_ORIGIN}/api/kanban/get-columns`
    );

    // Find the column by name or use the first column if not found
    const column = columnName
      ? columns.data.find((col) => col.title === columnName)
      : columns.data[0];

    if (!column) {
      // Create an embedded message for the error
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(
          `Column "${columnName}" not found. Task will be added to the first column.`
        );

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    // Create a new task to be added to the database
    let newCard = {
      taskId: `task-${Date.now()}`,
      content: interaction.options.getString("task_name"),
      startDate: interaction.options.getString("start_date") ?? "",
      dueDate: interaction.options.getString("due_date") ?? "",
      description: interaction.options.getString("task_description") ?? "",
      labels: [],
      nextTaskId: "",
    };

    // Add the task to the specified column
    axios.post(`${process.env.SERVER_ORIGIN}/api/kanban/add-task`, {
      columnId: column.id,
      newCard: newCard,
    });

    // Create an embedded message for the success
    const successEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Task Created")
      .setDescription(
        `Your task "${newCard.content}" has been created and added to the "${column.title}" column!`
      );

    await interaction.reply({ embeds: [successEmbed] });
  },
};
