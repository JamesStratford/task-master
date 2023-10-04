const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const axios = require("axios");
require("dotenv").config({ path: "frontend/.env" });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-deadline")
    .setDescription("Sets the deadline for a task"),

  async execute(interaction) {
    const userId = interaction.user.id;

    // Create dropdown menu with all tasks

    const tasks = await axios.get(
      `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks`
    );

    const taskOptions = Array.from(tasks).map((task) => {
      return {
        label: task.content.substring(0, 25),
        value: task.taskId,
      };
    });

    const taskSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("task_select")
      .setPlaceholder("Select a task")
      .addOptions(taskOptions);

    const taskSelectMenuComponent = new ActionRowBuilder().addComponents(
      taskSelectMenu
    );

    const taskSelectMenuResponse = await interaction.reply({
      content: "Select a task",
      components: [taskSelectMenuComponent],
      ephemeral: true,
    });

    // Wait for user to select a task

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await taskSelectMenuResponse.awaitMessageComponent({
        filter: collectorFilter,
        time: 60000,
      });

      // Check which task was selected

      let selectedTask;
      for (const task of tasks) {
        if (confirmation.value === task.taskId) {
          selectedTask = task;
        }
      }
    } catch (e) {
      await interaction.editReply({
        content: "Task not selected within 1 minute, command cancelled",
        components: [],
        ephemeral: true,
      });
    }

    // Ask user for due date

    const dateInput = new TextInputBuilder()
      .setCustomId("dateInput")
      .setPlaceholder("DD/MM/YYYY")
      .setMinLength(10)
      .setMaxLength(10)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const dateModalComponent = new ActionRowBuilder().addComponents(dateInput);

    const dateModal = new ModalBuilder()
      .setCustomId("dateModal")
      .setTitle("Set deadline")
      .setDescription("Please enter the due date for your task")
      .addComponents(dateModalComponent);

    await interaction.showModal(dateModal);

    // Wait for user to submit due date

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isModalSubmit()) return;
      if (interaction.customId === "dateModal") {
        
        const dueDate = interaction.fields.getTextInputValue("dateInput");

        // Check if due_date is valid

        const dateFormatRegex =
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

        if (!dateFormatRegex.test(dueDate)) {
          await interaction.reply({
            content: "Please use the format DD/MM/YYYY",
            ephemeral: true,
          });
          return;
        }

        // Set deadline to task in web server

        try {
          axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
            newTask: {
              taskId: selectedTask.taskId,
              due_date: dueDate,
            },
          });

          await interaction.reply(
            `Your task has been assigned the due date: ${dueDate}`
          );
        } catch (error) {
          console.error("Error fetching tasks: ", error.message);
          await interaction.reply(
            "Sorry, something went wrong while updating your task."
          );
        }
      }
    });
  },
};
