const { Events } = require("discord.js");
const {
  handleSetDeadlineColumn,
  handleSetDeadlineSelection,
} = require("../commands/editTasks/setDeadline");
const {
  handleGetTasksColumn,
  handleGetTasksSelection,
  handleGetTasksButtonEdit,
  handleGetTasksButtonDelete,
  handleGetTasksSelectName,
  handleGetTasksSelectDescription,
  handleGetTasksSelectStartDate,
  handleGetTasksSelectDueDate,
  handleGetTasksSelectAssignedUser,
  handleGetTasksSelectLabels,
  handleGetTasksModalName,
  handleGetTasksModalDescription,
  handleGetTasksModalStartDate,
  handleGetTasksModalDueDate,
  handleGetTasksAssignedUserSelection,
  handleGetTasksLabelsSelection,
} = require("../commands/viewTasks/getTasks");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    /**
     * Is a command
     */

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
      /**
       * Is a Button
       */
    } else if (interaction.isButton()) {
      // Set deadline column navigation
      if (
        interaction.customId === "set_deadline_next" ||
        interaction.customId === "set_deadline_prev"
      ) {
        await handleSetDeadlineColumn(interaction);
        // Get tasks column navigation
      } else if (
        interaction.customId === "get_tasks_next" ||
        interaction.customId === "get_tasks_prev"
      ) {
        await handleGetTasksColumn(interaction);
        // Get tasks add task
      } else if (interaction.customId.startsWith("get_tasks_edit")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksButtonEdit(interaction, selectedTaskId);
        // Get tasks delete task
      } else if (interaction.customId.startsWith("get_tasks_delete")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksButtonDelete(interaction, selectedTaskId);
      } else if (interaction.customId.startsWith("get_tasks_continue")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksSelection(interaction, selectedTaskId);
      }
      /**
       * Is a Select Menu
       */
    } else if (interaction.isStringSelectMenu()) {
      // Set deadline select menu
      if (interaction.customId === "set_deadline_select") {
        const selectedTaskId = interaction.values[0];
        await handleSetDeadlineSelection(interaction, selectedTaskId);
        // Get tasks select menu
      } else if (interaction.customId === "get_tasks_select") {
        const selectedTaskId = interaction.values[0];
        await handleGetTasksSelection(interaction, selectedTaskId);
        // Get tasks edit select menu
      } else if (interaction.customId.startsWith("get_tasks_select_edit")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        const selectedField = interaction.values[0];
        // Get tasks edit select menu name
        if (selectedField === "name") {
          await handleGetTasksSelectName(interaction, selectedTaskId);
          // Get tasks edit select menu description
        } else if (selectedField === "description") {
          await handleGetTasksSelectDescription(interaction, selectedTaskId);
          // Get tasks edit select menu start date
        } else if (selectedField === "startDate") {
          await handleGetTasksSelectStartDate(interaction, selectedTaskId);
          // Get tasks edit select menu due date
        } else if (selectedField === "dueDate") {
          await handleGetTasksSelectDueDate(interaction, selectedTaskId);
          // Get tasks edit select menu assigned user
        } else if (selectedField === "assignedUser") {
          await handleGetTasksSelectAssignedUser(interaction, selectedTaskId);
          // Get tasks edit select menu labels
        } else if (selectedField === "labels") {
          await handleGetTasksSelectLabels(interaction, selectedTaskId);
          // Get tasks edit select menu labels
        }
      } else if (interaction.customId.startsWith("get_tasks_select_labels")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksLabelsSelection(interaction, selectedTaskId);
      }
      /**
       * Is a Modal
       */
    } else if (interaction.isModalSubmit()) {
      // Get tasks modal name
      if (interaction.customId.startsWith("get_tasks_modal_name")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksModalName(interaction, selectedTaskId);
        // Get tasks modal description
      } else if (
        interaction.customId.startsWith("get_tasks_modal_description")
      ) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksModalDescription(interaction, selectedTaskId);
        // Get tasks edit modal
      } else if (interaction.customId.startsWith("get_tasks_modal_startDate")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksModalStartDate(interaction, selectedTaskId);
        // Get tasks modal due date
      } else if (interaction.customId.startsWith("get_tasks_modal_dueDate")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksModalDueDate(interaction, selectedTaskId);
      }
      /**
       * Is a User Select Menu
       */
    } else if (interaction.isUserSelectMenu()) {
      // Get tasks select assigned user
      if (interaction.customId.startsWith("get_tasks_select_assignedUser")) {
        const selectedTaskId = interaction.customId.split(":")[1];
        await handleGetTasksAssignedUserSelection(interaction, selectedTaskId);
      }
    }
  },
};
