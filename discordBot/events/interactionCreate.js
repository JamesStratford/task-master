const { Events } = require("discord.js");
const {
  handleSetDeadlineColumn,
  handleSetDeadlineSelection,
} = require("../commands/editTasks/setDeadline");
const {
  handleGetTasksColumn,
  handleGetTasksSelection,
  handleGetTasksEditModal,
  getTasksAdd,
  getTasksEdit,
  getTasksDelete,
} = require("../commands/viewTasks/getTasks");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    } else if (interaction.isButton()) {
      if (
        interaction.customId === "set_deadline_next" ||
        interaction.customId === "set_deadline_prev"
      ) {
        await handleSetDeadlineColumn(interaction);
      } else if (
        interaction.customId === "get_tasks_next" ||
        interaction.customId === "get_tasks_prev"
      ) {
        await handleGetTasksColumn(interaction);
      } else if (interaction.customId === "get_tasks_add") {
        await getTasksAdd(interaction);
      } else if (interaction.customId.startsWith("get_tasks_edit")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await getTasksEdit(interaction, selectedTaskId);
      } else if (interaction.customId.startsWith("get_tasks_delete")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await getTasksDelete(interaction, selectedTaskId);
      }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "set_deadline_select") {
        const selectedTaskId = interaction.values[0];
        await handleSetDeadlineSelection(interaction, selectedTaskId);
      } else if (interaction.customId === "get_tasks_select") {
        const selectedTaskId = interaction.values[0];
        await handleGetTasksSelection(interaction, selectedTaskId);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("get_tasks_modal")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksEditModal(interaction, selectedTaskId);
      }
    }
  },
};
