const {
  Events, 
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-task")
    .setDescription("Create a new task!"),

  async execute(interaction) {
    // Identify user
    const userId = interaction.user.id;

    const modal = new ModalBuilder()
      .setCustomId("myModal")
      .setTitle("Task Creation");

    const taskName = new TextInputBuilder()
      .setCustomId("task_name")
      .setLabel("Task Name")
      .setPlaceholder("Enter the name of the task you want to create")
      .setMinLength(1)
      .setMaxLength(100)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const columnId = new TextInputBuilder()
      .setCustomId("column_id")
      .setLabel("Column Id")
      .setPlaceholder("Enter the id of the column you want to add the task to")
      .setMinLength(1)
      .setMaxLength(100)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const dueDate = new TextInputBuilder()
      .setCustomId("due_date")
      .setLabel("Due Date")
      .setPlaceholder("Enter the due date of the task you want to create")
      .setMinLength(1)
      .setMaxLength(100)
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const taskDescription = new TextInputBuilder()
      .setCustomId("task_description")
      .setLabel("Task Description")
      .setPlaceholder("Enter the description of the task you want to create")
      .setMinLength(1)
      .setMaxLength(100)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const firstRow = new ActionRowBuilder().addComponents(taskName);
    const secondRow = new ActionRowBuilder().addComponents(columnId);
    const thirdRow = new ActionRowBuilder().addComponents(dueDate);
    const fourthRow = new ActionRowBuilder().addComponents(taskDescription);
    
    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

    await interaction.showModal(modal);

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isModalSubmit()) return;
      if (interaction.customId === "myModal") {
        const add = new ButtonBuilder()
          .setCustomId("add")
          .setLabel("Add task")
          .setStyle(ButtonStyle.SUCCESS);

        const edit = new ButtonBuilder()
          .setCustomId("edit")
          .setLabel("Edit task")
          .setStyle(ButtonStyle.PRIMARY);

        const deleteTask = new ButtonBuilder()
          .setCustomId("delete")
          .setLabel("Delete task")
          .setStyle(ButtonStyle.DANGER);

        const row = new ActionRowBuilder().addComponents(add, edit, deleteTask);

        await interaction.reply({
          content: `Task: ${interaction.options.getString(
            "task_name"
          )}\nDescription: ${
            interaction.options.getString("task_description") ??
            "No description"
          }\nDue Date: ${
            interaction.options.getString("due_date") ?? "No due date"
          }`,
          components: [row],
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
          const confirmation = await response.awaitMessageComponent({
            filter: collectorFilter,
            time: 60_000,
          });

          if (confirmation.customId === "add") {
            // Create a new task to be added to the database

            let newCard = {
              taskId: `task-${Date.now()}`,
              content: interaction.options.getString("task_name"),
              due_date: interaction.options.getString("due_date") ?? "",
              description:
                interaction.options.getString("task_description") ?? "",
              labels: [],
              nextTaskId: "",
            };

            // Add task to database

            try {
              axios.post(`${process.env.SERVER_ORIGIN}/api/kanban/add-task`, {
                columnId: interaction.options.getString("column_id"),
                newCard: newCard,
              });
            } catch (error) {
              console.error("Error creating task: ", error.message);
              await interaction.reply(
                "Sorry, something went wrong while creating your task."
              );
            }

            await interaction.reply(
              `Your task ${newCard.content} has been created!`
            );
          } else if (confirmation.customId === "edit") {
          } else if (confirmation.customId === "delete") {
            await interaction.editReply("Task deleted!");
          }
        } catch (e) {
          await interaction.editReply({
            content: "Confirmation not received within 1 minute, cancelling",
            components: [],
          });
        }
      }
    });

    // Check if user is happy with the task

    // To be implemented later...

    // let columnName = interaction.options.getString("column_name")

    // const columns = axios.get(`${process.env.SERVER_ORIGIN}/api/kanban/get-columns`)

    // console.log(`Columns: ${columns}`);

    // const columnId = columns.find(column => column.title === columnName).id
  },
};
