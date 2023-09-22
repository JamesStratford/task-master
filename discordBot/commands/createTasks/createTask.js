const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-task")
    .setDescription("Create a new task!")
    .addStringOption((option) =>
      option
        .setName("task_name")
        .setDescription("Enter the name of the task you want to create")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("column_id")
        .setDescription(
          "Enter the id of the column you want to add the task to"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("due_date")
        .setDescription("Enter the due date of the task you want to create")
    )
    .addStringOption((option) =>
      option
        .setName("task_description")
        .setDescription("Enter the description of the task you want to create")
    ),

  async execute(interaction) {
    // Identify user
    const userId = interaction.user.id;

    // To be implemented later...

    // let columnName = interaction.options.getString("column_name")

    // const columns = axios.get(`${process.env.SERVER_ORIGIN}/api/kanban/get-columns`)

    // console.log(`Columns: ${columns}`);

    // const columnId = columns.find(column => column.title === columnName).id


    
    // Create a new task to be added to the database

    let newCard = {
      taskId: `task-${Date.now()}`,
      content: interaction.options.getString("task_name"),
      due_date: interaction.options.getString("due_date") ?? "",
      description: interaction.options.getString("task_description") ?? "",
      labels: [],
      nextTaskId: "",
    };

    // Add task to database

    axios.post(`${process.env.SERVER_ORIGIN}/api/kanban/add-task`, {
      columnId: interaction.options.getString("column_id"),
      newCard: newCard,
    });

    await interaction.reply(`Your task ${newCard.content} has been created!`);
  },
};
