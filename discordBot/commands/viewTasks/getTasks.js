const {
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const axios = require("axios");

require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-tasks")
    .setDescription("Replies with the users current tasks"),

  execute: execute,
  handleGetTasksColumn: handleGetTasksColumn,
  handleGetTasksSelection: handleGetTasksSelection,
};

const nextButton = new ButtonBuilder()
  .setCustomId("get_tasks_next")
  .setLabel("Next")
  .setStyle(ButtonStyle.Primary);

const prevButton = new ButtonBuilder()
  .setCustomId("get_tasks_prev")
  .setLabel("Previous")
  .setStyle(ButtonStyle.Secondary);

const addButton = new ButtonBuilder()
  .setCustomId("get_tasks_add")
  .setLabel("Add")
  .setStyle(ButtonStyle.Success);

const editButton = new ButtonBuilder()
  .setCustomId("get_tasks_edit")
  .setLabel("Edit")
  .setStyle(ButtonStyle.Primary);

const deleteButton = new ButtonBuilder()
  .setCustomId("get_tasks_delete")
  .setLabel("Delete")
  .setStyle(ButtonStyle.Danger);

let currentColumnIndex = 0;

async function execute(interaction) {
  await interaction.deferReply();

  const userId = interaction.user.id;

  const totalColumnsResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-total-column-count`
  );

  const totalColumns = totalColumnsResponse.data.count;

  const selectMenu = await getColumnMenu();

  const columnResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-column-by-index/${currentColumnIndex}`
  );

  const column = columnResponse.data;

  nextButton.setDisabled(currentColumnIndex >= totalColumns - 1);
  prevButton.setDisabled(currentColumnIndex <= 0);

  const columnMenuEmbed = new EmbedBuilder()
    .setTitle("Select a Task to View")
    .setDescription(`Select a task from: **${column.title}**`)
    .setColor("Blue");

  await interaction.editReply({
    embeds: [columnMenuEmbed],
    components: [
      selectMenu,
      new ActionRowBuilder().addComponents(prevButton, nextButton),
    ],
  });
}

async function getColumnMenu() {
  try {
    // Get the column by index
    const columnResponse = await axios.get(
      `${process.env.SERVER_ORIGIN}/api/kanban/get-column-by-index/${currentColumnIndex}`
    );

    const column = columnResponse.data;

    if (!column) {
      throw new Error(`Column not found for index: ${currentColumnIndex}`);
    }

    // Fetch tasks based on taskIds in the column
    const tasksResponse = await axios.post(
      `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
      {
        taskIds: column.taskIds,
      }
    );

    const tasks = tasksResponse.data;

    if (tasks.length === 0) {
      const taskSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("get_tasks_select")
        .setPlaceholder("No tasks")
        .addOptions({ label: "No tasks", value: "no_tasks" })
        .setDisabled(true);

      return new ActionRowBuilder().addComponents(taskSelectMenu);
    }

    // Convert tasks to select menu options
    const taskOptions = tasks.map((task) => {
      if (!task.content || task.content.trim() === "") {
        // Provide a default label if task content is empty
        return {
          label: "No Content",
          value: task.taskId,
        };
      }
      return {
        label: task.content.substring(0, 25),
        value: task.taskId,
      };
    });

    console.log(taskOptions);

    // Construct the select menu
    const taskSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("get_tasks_select")
      .setPlaceholder("Select a task")
      .addOptions(taskOptions);

    const taskSelectMenuComponent = new ActionRowBuilder().addComponents(
      taskSelectMenu
    );

    return taskSelectMenuComponent;
  } catch (error) {
    console.error(`Error in getColumnMenu: ${error.message}`);
    throw error;
  }
}

async function handleGetTasksColumn(interaction) {
  const totalColumnsResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-total-column-count`
  );

  const totalColumns = totalColumnsResponse.data.count;

  if (
    interaction.customId === "next_column" &&
    currentColumnIndex < totalColumns - 1
  ) {
    currentColumnIndex++;
  } else if (interaction.customId === "prev_column" && currentColumnIndex > 0) {
    currentColumnIndex--;
  }

  const columnResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-column-by-index/${currentColumnIndex}`
  );

  const column = columnResponse.data;

  const selectMenu = await getColumnMenu(currentColumnIndex);

  nextButton.setDisabled(currentColumnIndex >= totalColumns - 1);
  prevButton.setDisabled(currentColumnIndex <= 0);

  const columnMenuEmbed = new EmbedBuilder()
    .setTitle("Select a Task to View")
    .setDescription(`Select a task from: **${column.title}**`)
    .setColor("Blue");

  await interaction.update({
    embeds: [columnMenuEmbed],
    components: [
      selectMenu,
      new ActionRowBuilder().addComponents(prevButton, nextButton),
    ],
  });
}

async function handleGetTasksSelection(interaction, selectedTaskId) {
  await interaction.deferReply();

  await interaction.message.delete();

  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const selectedTask = tasksResponse.data[0];

  const taskEmbed = new EmbedBuilder()
    .setTitle(`${selectedTask.content}`)
    .setDescription(
      `**Description:** \n\t${selectedTask.content}` +
        `\n\n**Start Date:** \n\t${selectedTask.startDate}` +
        `\n\n**Due Date:** \n\t${selectedTask.dueDate}` +
        `\n\n**Labels:** \n\t${selectedTask.labels.join(", ")}`
    )
    .setColor("Blue");

  await interaction.editReply({
    embeds: [taskEmbed],
    components: [
      new ActionRowBuilder().addComponents(addButton, editButton, deleteButton),
    ],
  });
}
